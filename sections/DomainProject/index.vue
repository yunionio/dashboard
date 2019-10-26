<template>
  <div class="d-flex">
    <template v-if="!isAdminMode && !isDomainMode">
      <div style="margin-bottom: 24px;">{{ projectData.name }}</div>
    </template>
    <a-row :gutter="8" class="w-100" v-else>
      <a-col :span="12">
        <a-form-item v-if="isAdminMode && isDomainMode">
          <a-select
            class="w-100"
            style="width:100%"
            :labelInValue="labelInValue"
            v-decorator="decorators.domain"
            :loading="domainLoading"
            placeholder="请选择域"
            @change="domainChange"
            showSearch>
            <a-select-option v-for="item of domains" :value="item.id" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item>
          <a-select
            class="w-100"
            :labelInValue="labelInValue"
            v-decorator="decorators.project"
            :loading="projectLoading"
            placeholder="请选择项目"
            @change="projectChange"
            showSearch>
            <a-select-option v-for="item of projects" :value="item.id" :key="item.id" :label="item.name">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'

export default {
  name: 'DomainProject',
  props: {
    labelInValue: {
      type: Boolean,
      default: true,
    },
    defaultProjectDomain: { // 表单回填时的对象 { domain: <domain_id>, project: <project_id> }
      type: Object,
      default: () => ({}),
    },
    decorators: {
      type: Object,
      validator: val => R.is(Array, val.domain) && R.is(Array, val.project),
    },
    fc: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      domainData: {},
      domains: [],
      domainLoading: false,
      projectData: {},
      projects: [],
      projectLoading: false,
    }
  },
  computed: mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  created () {
    this.dm = new Manager('domains', 'v1')
    this.pm = new Manager('projects', 'v1')
    if (this.l3PermissionEnable) {
      this.fetchDomains()
    } else {
      this.fetchProjects()
    }
  },
  methods: {
    async fetchDomains () {
      if (!this.isAdminMode) {
        const data = [{
          key: this.userInfo.projectDomainId,
          name: this.userInfo.projectDomain,
        }]
        this.domains = data
        this.domainChange(data[0])
        return
      }
      this.domainLoading = true
      try {
        const params = {
          scope: this.scope,
          limit: 0,
        }
        const response = await this.dm.list({ params })
        const data = response.data.data || []
        this.domains = data
        const findDomain = this.domains.find(val => val.id === this.defaultProjectDomain.domain)
        const defaultDomain = findDomain || data[0]
        this.domainChange(defaultDomain || {})
      } catch (error) {
        throw error
      } finally {
        this.domainLoading = false
      }
    },
    async fetchProjects () {
      if (!this.isAdminMode && !this.isDomainMode) {
        const data = [{
          key: this.userInfo.projectId,
          name: this.userInfo.projectName,
        }]
        this.projects = data
        this.projectChange(data[0])
        return
      }
      this.projectLoading = true
      try {
        const params = {
          scope: this.scope,
          domain_id: this.l3PermissionEnable ? this.domainData.key : 'default',
        }
        const response = await this.pm.list({ params })
        const data = response.data.data || []
        this.projects = data
        const findProject = this.projects.find(val => val.id === this.defaultProjectDomain.project)
        const defaultProject = findProject || data[0]
        this.projectChange(defaultProject || {})
      } catch (error) {
        throw error
      } finally {
        this.projectLoading = false
      }
    },
    domainChange (domain) {
      this.domainData = domain
      this.fetchProjects()
      this.fc.setFieldsValue({
        project: undefined,
      })
    },
    projectChange (project) {
      this.projectData = project
      this.$emit('update:project', project)
    },
  },
}
</script>

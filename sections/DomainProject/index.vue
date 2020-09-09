<template>
  <div class="d-flex">
    <template v-if="!isAdminMode && !isDomainMode">
      <div style="margin-bottom: 24px;">{{ projectData.label }}</div>
    </template>
    <a-row :gutter="8" class="w-100" v-else>
      <a-col :span="12">
        <a-form-item :class="{ 'mb-0': mb0 }" v-if="isAdminMode && l3PermissionEnable" :wrapperCol="{ span: 24 }">
          <a-select
            :allowClear="allowClear"
            class="w-100"
            dropdownClassName="oc-select-dropdown"
            style="width:100%"
            :labelInValue="labelInValue"
            v-decorator="decorators.domain"
            :loading="domainLoading"
            :placeholder="$t('rules.domain')"
            @change="domainChange"
            :filterOption="filterOption"
            showSearch>
            <a-select-option v-for="item of domains" :value="item.key" :key="item.key">
              <span class="text-color-secondary option-prefix">{{ $t('dictionary.domain') }}: </span>{{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="(isAdminMode && l3PermissionEnable) ? 12 : 24">
        <a-form-item :class="{ 'mb-0': mb0 }" :wrapperCol="{ span: 24 }">
          <a-select
            :allowClear="allowClear"
            class="w-100"
            dropdownClassName="oc-select-dropdown"
            :labelInValue="labelInValue"
            v-decorator="decorators.project"
            :loading="projectLoading"
            :placeholder="$t('rules.project')"
            @change="projectChange"
            :filterOption="filterOption"
            showSearch>
            <a-select-option v-for="item of projects" :value="item.key" :key="item.key">
              <span class="text-color-secondary option-prefix">{{ $t('dictionary.project') }}: </span>{{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'

export default {
  name: 'DomainProject',
  props: {
    labelInValue: {
      type: Boolean,
      default: true,
    },
    decorators: {
      type: Object,
      validator: val => R.is(Array, val.domain) && R.is(Array, val.project),
    },
    fc: {
      type: Object,
      required: true,
    },
    allowClear: Boolean,
    getDomainList: Function,
    isDefaultSelect: {
      type: Boolean,
      default: true,
    },
    mb0: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      domains: [],
      domainLoading: false,
      projectData: {},
      projects: [],
      projectLoading: false,
    }
  },
  computed: mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  mounted () {
    this.dm = new Manager('domains', 'v1')
    this.pm = new Manager('projects', 'v1')
    if (this.isAdminMode && this.l3PermissionEnable) {
      this.fetchDomains()
    } else {
      this.fetchProjects('default')
    }
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[1].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    /*
     * @params {Object} domain { key: <domainId> }
     */
    _setInitDomain (domain) {
      if (!R.isNil(domain) && !R.isEmpty(domain)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            domain: { key: domain.key, label: domain.label },
          })
        } else {
          this.fc.setFieldsValue({
            domain: domain.key,
          })
        }
      }
    },
    /*
     * @params {Object} project { key: <projectId> }
     */
    _setInitProject (project) {
      if (!R.isNil(project) && !R.isEmpty(project)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            project: { key: project.key, label: project.label },
          })
        } else {
          this.fc.setFieldsValue({
            project: project.key,
          })
        }
      }
    },
    async fetchDomains () {
      if (!this.isAdminMode) {
        const data = [{
          key: this.userInfo.projectDomainId,
          label: this.userInfo.projectDomain,
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
          filter: 'enabled.equals(1)', // 仅显示启用状态下的域
        }
        let response
        if (this.getDomainList) {
          response = await this.getDomainList(params)
        } else {
          response = await this.dm.list({ params })
          if (response.data && !response.data.data.find(domain => domain.id === this.userInfo.projectDomainId)) return // 如果下拉列表没有当前域值，return
        }
        const data = response.data.data || []
        this.domains = data.map(val => ({ ...val, key: val.id, label: val.name }))
        let defaultData = { key: this.userInfo.projectDomainId, label: this.userInfo.projectDomain }
        const initialValue = _.get(this.decorators, 'domain[1].initialValue')
        if (initialValue) {
          const findInitValue = this.domains.find(val => val.key === (initialValue.key || initialValue))
          if (findInitValue) {
            defaultData = { key: findInitValue.key, label: findInitValue.label }
          }
        }
        const projectInitialValue = _.get(this.decorators, 'project[1].initialValue')
        const domainChange = () => {
          this._setInitDomain(defaultData)
          this.domainChange(defaultData || {})
        }
        if (projectInitialValue) {
          domainChange()
        } else {
          if (this.isDefaultSelect) {
            domainChange()
          }
        }
      } catch (error) {
        throw error
      } finally {
        this.domainLoading = false
      }
    },
    async fetchProjects (domainId) {
      if (!this.isAdminMode && !this.isDomainMode) {
        const data = [{
          key: this.userInfo.projectId,
          label: this.userInfo.projectName,
        }]
        this.projects = data
        // 普通视图下不用判断 isDefaultSelect
        this.projectChange(data[0])
        this._setInitProject(data[0])
        return
      }
      this.projectLoading = true
      try {
        const params = {
          scope: this.scope,
        }
        if (domainId && !this.isDomainMode) params.domain_id = domainId
        if (this.isAdminMode) {
          params.project_domain = domainId || this.userInfo.projectDomainId
          delete params.scope
          delete params.domain_id
        }
        const response = await this.pm.list({ params })
        const data = response.data.data
        this.projects = data.map(val => ({ ...val, key: val.id, label: val.name })) || []
        let defaultData = { key: this.userInfo.projectId, label: this.userInfo.projectName }
        if (!this.projects.find(val => val.key === this.userInfo.projectId)) { // 如果下拉列表没有当前项目值，取第一个值
          defaultData = this.projects[0]
        }
        const initialValue = _.get(this.decorators, 'project[1].initialValue')
        if (initialValue) {
          const findInitValue = this.projects.find(val => val.key === (initialValue.key || initialValue))
          if (findInitValue) {
            defaultData = { key: findInitValue.key, label: findInitValue.label }
          }
        }
        const projectChange = () => {
          this.projectChange(defaultData || {})
          this._setInitProject(defaultData || {})
        }
        if (initialValue) {
          projectChange()
        } else {
          if (this.isDefaultSelect) {
            projectChange()
          }
        }
      } catch (error) {
        throw error
      } finally {
        this.projectLoading = false
      }
    },
    /**
     * domain {Object|String}
     */
    domainChange (domain) {
      const domainId = R.is(Object, domain) ? domain.key : domain
      if (this.labelInValue) {
        this.$emit('update:domain', domain)
      } else {
        this.$emit('update:domain', domainId)
      }
      if (domainId) {
        this.fetchProjects(domainId)
        this.fc.setFieldsValue({
          project: undefined,
        })
      } else {
        this.fc.setFieldsValue({
          domain: undefined,
          project: undefined,
        })
        this.projects = []
      }
    },
    projectChange (project) {
      const projectId = R.is(Object, project) ? project.key : project
      this.projectData = project
      if (this.labelInValue) {
        this.$emit('update:project', project)
      } else {
        this.$emit('update:project', projectId)
      }
      if (!this.isAdminMode && !this.isDomainMode) {
        this.fc.getFieldDecorator('project', { preserve: true, initialValue: project })
      }
    },
  },
}
</script>

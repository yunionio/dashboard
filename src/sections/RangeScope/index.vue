<template>
  <div>
    <a-radio-group v-model="range_scope" @change="billingScopeChangeHandler">
      <a-radio-button
        v-for="item in rangeScopeOptions"
        :value="item.value"
        :key="item.value">{{ item.label }}</a-radio-button>
    </a-radio-group>
    <!-- 域选择 -->
    <a-select
      v-if="isShowDomainSelect"
      v-model="domain_id"
      :loading="domainLoading"
      :disabled="domainLoading"
      style="width: 100%"
      show-search
      option-filter-prop="children"
      :filter-option="filterDomainOption"
      @search="handleDomainSearch"
      @change="domainChangeHandler">
      <a-select-option v-for="item in domainOptions" :value="item.value" :key="item.value">{{ item.label }}</a-select-option>
    </a-select>
    <!-- 项目选择 -->
    <a-select
      v-if="isShowProjectSelect"
      v-model="project_id"
      :loading="projectLoading"
      :disabled="projectLoading"
      style="width: 100%"
      show-search
      option-filter-prop="children"
      :filter-option="filterProjectOption"
      @search="handleDomainSearch"
      @change="projectChangeHandler">
      <a-select-option v-for="item in projectOptions" :value="item.value" :key="item.value">
        <div class="d-flex">
          <span class="text-truncate flex-fill mr-2" :title="item.label">{{ item.label }}</span>
          <span style="color: #8492a6; font-size: 13px" v-if="isAdminMode && l3PermissionEnable">
            {{ $t('common_257') }}{{ $t('dictionary.domain') }}: {{ item.project_domain }}
          </span>
        </div>
      </a-select-option>
    </a-select>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { getRangeScopeOptions } from '@/utils/rangeScope'

export default {
  name: 'RangeScope',
  props: {
    value: {
      type: Object,
    },
    subscriptionScope: {
      type: String,
      default: 'system',
    },
    hiddenScope: {
      type: Array,
      default () {
        return []
      },
    },
    domain: {
      type: String,
    },
  },
  data () {
    const value = this.value || {}
    return {
      range_scope: value.range_scope,
      domain_id: value.domain_id,
      project_id: value.project_id,
      domainOptions: [],
      domainLoading: false,
      domainLoaded: true,
      projectOptions: [],
      projectLoading: false,
      projectLoaded: true,
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable', 'scope', 'isAdminMode', 'userInfo']),
    rangeScopeOptions () {
      let options = getRangeScopeOptions.call(this, this.subscriptionScope)
      options = this.hiddenScope.length > 0 ? options.filter(item => !this.hiddenScope.includes(item.value)) : options
      return options.filter(item => {
        if (this.l3PermissionEnable) {
          return item.scope.includes(this.subscriptionScope)
        }
        return item.scope.includes(this.subscriptionScope) && !['any_domain', 'domain', 'any_project_in_domain'].includes(item.value)
      })
    },
    isShowDomainSelect () {
      return this.l3PermissionEnable &&
      ['domain', 'any_project_in_domain'].includes(this.range_scope) &&
      this.subscriptionScope === 'system'
    },
    isShowProjectSelect () {
      return this.range_scope === 'project' && this.subscriptionScope !== 'project'
    },
  },
  watch: {
    value (val = {}) {
      this.range_scope = val.range_scope
      this.domain_id = val.domain_id
      this.project_id = val.project_id
    },
    subscriptionScope (val) {
      const range_scope = val
      this.range_scope = range_scope
      this.triggerChange({ range_scope })
    },
    domain (val) {
      this.project_id = ''
      this.initProjectData((data) => {
        if (data && data.length > 0) {
          this.projectOptions = data
          const project_id = data[0].value
          this.project_id = project_id
          this.triggerChange({ domain_id: val, project_id })
        }
      })
    },
  },
  created () {
    this.dm = new this.$Manager('domains', 'v1')
    this.pm = new this.$Manager('projects', 'v1')
    this.initData()
  },
  methods: {
    initData () {
      this.initDomainData((data) => {
        if (data && data.length > 0) {
          this.domainOptions = data
          const domain_id = this.userInfo.projectDomainId
          this.domain_id = domain_id
          this.triggerChange({ domain_id })
        }
      })
      this.initProjectData((data) => {
        if (data && data.length > 0) {
          this.projectOptions = data
          const { projectId: project_id, projectDomainId: domain_id } = this.userInfo
          this.project_id = project_id
          this.triggerChange({ domain_id, project_id })
        }
      })
    },
    async initDomainData (callback) {
      this.domainLoading = true
      this.domainLoaded = false
      this.domainOptions = []

      try {
        const params = { limit: 0, scope: this.scope }
        const response = await this.dm.list({ params })
        const domainOptions = response.data.data.map(item => {
          return {
            label: item.name,
            value: item.id,
          }
        })
        this.domainLoaded = true
        callback && callback(domainOptions)
      } catch (error) {
        throw error
      } finally {
        this.domainLoading = false
      }
    },
    async initProjectData (callback) {
      this.projectLoading = true
      this.projectLoaded = false
      this.projectOptions = []

      try {
        const params = { limit: 0, scope: this.scope }
        if (this.subscriptionScope === 'domain' && this.domain) {
          params.project_domain = this.domain
        }
        const response = await this.pm.list({ params })
        const projectOptions = response.data.data.map(item => {
          return {
            label: item.name,
            value: item.id,
            project_domain: item.project_domain,
            domain_id: item.domain_id,
          }
        })
        this.projectLoaded = true
        callback && callback(projectOptions)
      } catch (error) {
        throw error
      } finally {
        this.projectLoading = false
      }
    },
    billingScopeChangeHandler (e) {
      if (e.target.value === 'project') {
        this.initProjectData((data) => {
          if (data && data.length > 0) {
            this.projectOptions = data
            const { value: project_id, domain_id } = data[0]
            this.project_id = project_id
            this.triggerChange({ domain_id, project_id })
          }
        })
      } else if (e.target.value === 'domain') {
        this.initDomainData((data) => {
          if (data && data.length > 0) {
            this.domainOptions = data
            const domain_id = data[0].value
            this.domain_id = domain_id
            this.triggerChange({ domain_id })
          }
        })
      }
      this.triggerChange({ range_scope: e.target.value })
    },
    domainChangeHandler (domain_id) {
      this.triggerChange({ domain_id })
    },
    projectChangeHandler (project_id) {
      const curProject = this.projectOptions.find(item => item.value === project_id)
      this.triggerChange({ domain_id: curProject.domain_id, project_id })
    },
    triggerChange (changedValue) {
      this.$emit('change', Object.assign({}, _.pick(this.$data, ['range_scope', 'domain_id', 'project_id']), changedValue))
    },
    filterDomainOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    filterProjectOption (input, option) {
      return (
        option.componentOptions.children[0].children[0].children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>

<style></style>

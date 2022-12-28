<template>
  <div>
    <a-form-item :label="$t('dictionary.domain')" v-bind="formLayout" v-if="isAdminMode && l3PermissionEnable">
      <a-select
        :allowClear="allowClear"
        :labelInValue="labelInValue"
        v-decorator="decorators.domain"
        :loading="domainLoading"
        :placeholder="$t('rules.domain')"
        @change="domainChange"
        :filterOption="filterOption"
        showSearch>
        <a-select-option v-for="item of domains" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="$t('cloudenv.resource_map_type')" :extra="resourceMapExtra">
      <a-radio-group v-decorator="extraDecorators.resource_map_type" @change="resourceMapTypeChange">
        <a-radio-button value="target_project">{{$t('cloudenv.target_project')}}</a-radio-button>
        <a-radio-button v-if="showAutoCreateProject" value="auto_create_project">{{$t('cloudenv.map_by_cloudproject')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="resourceMapType === 'target_project' ? $t('scope.text_573', [$t('dictionary.project')]) : $t('cloudenv.map_project_is_no_cloudproject')">
      <a-select
        :disabled="disableProjectSelect || isOpenstack"
        :allowClear="allowClear"
        :labelInValue="labelInValue"
        v-decorator="decorators.project"
        :loading="projectLoading"
        :placeholder="$t('rules.project')"
        @change="projectChange"
        :filterOption="filterOption"
        showSearch>
          <a-select-option v-for="item of projects" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="$t('cloudenv.text_580')">
      <a-switch v-decorator="extraDecorators.is_open_project_mapping" :checkedChildren="$t('cloudenv.text_84')" :unCheckedChildren="$t('cloudenv.text_85')" @change="openProjectMappingChange" />
      <a-form-item>
        <base-select
          v-if="openProjectMapping"
          v-decorator="extraDecorators.project_mapping_id"
          resource="project_mappings"
          showSync
          :select-props="{ placeholder: $t('common.tips.select', [$t('cloudenv.text_580')]) }" />
          <div v-if="openProjectMapping" slot="extra">
            {{$t('cloudenv.no_project_mapping')}}
            <help-link :href="href">{{$t('cloudenv.go_create')}}</help-link>
          </div>
      </a-form-item>
    </a-form-item>
    <a-form-item v-if="openProjectMapping" :label="$t('cloudenv.project_mapping_effective_scope')" :extra="effectiveScopeExtra">
      <a-radio-group v-decorator="extraDecorators.effective_scope" @change="effectiveScopeChange">
        <a-radio-button value="resource">{{$t('cloudenv.resource_tag')}}</a-radio-button>
        <a-radio-button value="project">{{$t('cloudenv.project_tag')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
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
    formLayout: Object,
    provider: {
      type: String,
    },
    showAutoCreateProject: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      domains: [],
      domainLoading: false,
      projectData: {},
      projects: [],
      projectLoading: false,
      disableProjectSelect: false,
      extraDecorators: {
        resource_map_type: [
          'resource_map_type',
          {
            initialValue: 'target_project',
          },
        ],
        is_open_project_mapping: [
          'is_open_project_mapping',
          {
            initialValue: false,
          },
        ],
        project_mapping_id: [
          'project_mapping_id',
        ],
        effective_scope: [
          'effective_scope',
          {
            initialValue: 'resource',
          },
        ],
      },
      resourceMapType: 'target_project',
      openProjectMapping: false,
      effectiveScope: 'resource',
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    isOpenstack () {
      if (this.provider) {
        return this.provider.toLowerCase() === 'openstack'
      }
      return false
    },
    resourceMapExtra () {
      if (this.resourceMapType === 'target_project') {
        if (this.openProjectMapping) {
          return this.$t('cloudenv.resource_map_project_mapping_target_project')
        } else {
          return this.$t('cloudenv.resource_map_target_project')
        }
      } else if (this.resourceMapType === 'auto_create_project') {
        if (this.openProjectMapping) {
          return this.$t('cloudenv.resource_map_project_mapping_cloudproject')
        } else {
          return this.$t('cloudenv.resource_map_cloudproject')
        }
      }
      return ''
    },
    effectiveScopeExtra () {
      if (this.effectiveScope === 'resource') {
        return this.$t('cloudenv.resource_tag_tip')
      }
      return this.$t('cloudenv.project_tag_tip')
    },
    href () {
      const url = this.$router.resolve('/projectmapping')
      return url.href
    },
  },
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
    resourceMapTypeChange (e) {
      this.resourceMapType = e.target.value
    },
    effectiveScopeChange (e) {
      this.effectiveScope = e.target.value
    },
    openProjectMappingChange (e) {
      this.openProjectMapping = e
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
        const response = await this.dm.list({ params })
        const data = response.data.data || []
        this.domains = data.map(val => ({ ...val, key: val.id, label: val.name }))
        let defaultData = { key: this.userInfo.projectDomainId, label: this.userInfo.projectDomain }
        if (!this.domains.find(val => val.key === this.userInfo.projectDomainId)) return // 如果下拉列表没有当前域值，return
        const initialValue = _.get(this.decorators, 'domain[1].initialValue')
        if (initialValue) {
          const findInitValue = this.domains.find(val => val.key === (initialValue.key || initialValue))
          if (findInitValue) {
            defaultData = { key: findInitValue.key, label: findInitValue.label }
          }
        }
        this._setInitDomain(defaultData)
        this.domainChange(defaultData || {})
      } catch (error) {
        throw error
      } finally {
        this.domainLoading = false
      }
    },
    async fetchProjects (domainId = 'default') {
      if (!this.isAdminMode && !this.isDomainMode) {
        const data = [{
          key: this.userInfo.projectId,
          label: this.userInfo.projectName,
        }]
        this.projects = data
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
        this.projectChange(defaultData || {})
        this._setInitProject(defaultData || {})
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
      if (domainId) {
        this.fetchProjects(domainId)
        this.fc.setFieldsValue({
          project: undefined,
        })
        this.$emit('update:domain', domainId)
      } else {
        this.fc.setFieldsValue({
          domain: undefined,
          project: undefined,
        })
        this.projects = []
      }
    },
    projectChange (project) {
      this.projectData = project
      this.$emit('update:project', project)
      if (!this.isAdminMode && !this.isDomainMode) {
        this.fc.getFieldDecorator('project', { preserve: true, initialValue: project })
      }
    },
    handleAutoCreateProjectChange (e) {
      const checked = e.target.checked
      this.disableProjectSelect = checked
      this.$bus.$emit('updateAutoCreate', checked)
    },
    fetchProjectsHandle (e) {
      const domain = this.fc.getFieldValue('domain')
      this.fetchProjects(domain?.key)
    },
  },
}
</script>

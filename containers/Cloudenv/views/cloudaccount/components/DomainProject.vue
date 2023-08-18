<template>
  <div>
    <a-form-item :label="$t('dictionary.domain')" v-bind="formLayout" v-if="isAdminMode && l3PermissionEnable">
      <base-select
        ref="domain"
        v-decorator="decorators.domain"
        resource="domains"
        remote
        :is-default-select="isDefaultSelect"
        :params="domainParams"
        :select-props="{
          allowClear,
          labelInValue,
          placeholder: $t('rules.domain'),
          dropdownClassName: 'oc-select-dropdown',
          labelInValueKeyName: 'key',
        }"
        @change="domainChange"
        @update:resList="updateDomainList">
        <template #optionLabelTemplate="{ item }">
          <span class="text-color-secondary option-prefix">{{ $t('dictionary.domain') }}: </span>{{ item.name }}
        </template>
      </base-select>
    </a-form-item>
    <a-form-item :label="$t('cloudenv.resource_map_type')" :extra="resourceMapExtra">
      <a-radio-group v-decorator="extraDecorators.resource_map_type" @change="resourceMapTypeChange">
        <a-radio-button value="target_project">{{$t('cloudenv.target_project')}}</a-radio-button>
        <a-radio-button v-if="showAutoCreateProject" value="auto_create_project">{{$t('cloudenv.map_by_cloudproject')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="resourceMapType === 'target_project' ? $t('scope.text_573', [$t('dictionary.project')]) : $t('cloudenv.map_project_is_no_cloudproject')">
      <a-radio-group v-if="resourceMapType === 'auto_create_project'" v-decorator="extraDecorators.create_project_target" @change="createProjectTargetChange">
        <a-radio-button value="project">{{$t('dictionary.project')}}</a-radio-button>
        <a-radio-button value="cloudprovider">{{$t('dictionary.cloudprovider')}}</a-radio-button>
      </a-radio-group>
      <base-select
        v-if="createProjectTarget !== 'cloudprovider'"
        ref="project"
        v-decorator="decorators.project"
        resource="projects"
        remote
        :is-default-select="isDefaultSelect"
        :params="projectParams"
        :select-props="{
          allowClear,
          labelInValue,
          placeholder: $t('rules.project'),
          dropdownClassName: 'oc-select-dropdown',
          labelInValueKeyName: 'key',
        }"
        @change="projectChange"
        @update:resList="updateProjectList">
        <template #optionLabelTemplate="{ item }">
          <span class="text-color-secondary option-prefix">{{ $t('dictionary.project') }}: </span>{{ item.name }}
        </template>
      </base-select>
    </a-form-item>
    <a-form-item :label="$t('cloudenv.text_580')" class="mb-0">
      <a-switch v-decorator="extraDecorators.is_open_project_mapping" :checkedChildren="$t('cloudenv.text_84')" :unCheckedChildren="$t('cloudenv.text_85')" @change="openProjectMappingChange" />
      <a-form-item>
        <base-select
          v-if="openProjectMapping"
          v-decorator="extraDecorators.project_mapping_id"
          resource="project_mappings"
          showSync
          :select-props="{ placeholder: $t('common.tips.select', [$t('cloudenv.text_580')]) }"
          :params="projectMappingParams" />
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
    isDefaultSelect: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      domains: [],
      domainParams: {
        scope: this.scope,
        limit: 20,
        filter: 'enabled.equals(1)', // 仅显示启用状态下的域
      },
      domainId: '',
      projectData: {},
      projects: [],
      disableProjectSelect: false,
      extraDecorators: {
        resource_map_type: [
          'resource_map_type',
          {
            initialValue: 'target_project',
          },
        ],
        create_project_target: [
          'create_project_target',
          {
            initialValue: 'project',
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
      createProjectTarget: 'project',
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
    projectParams () {
      const ret = {
        scope: this.scope,
        limit: 20,
      }
      const domainId = this.domainId
      if (domainId && !this.isDomainMode) {
        ret.domain_id = domainId
      }
      if (this.isAdminMode) {
        delete ret.scope
        delete ret.domain_id
        ret.project_domain = domainId || this.userInfo.projectDomainId
      }
      return ret
    },
    projectMappingParams () {
      if (this.isAdminMode) {
        return {
          scope: this.scope,
          project_domain: this.domainId || this.userInfo.projectDomainId,
        }
      }
      return {
        scope: this.scope,
      }
    },
  },
  mounted () {
    this.initDefaultData()
  },
  methods: {
    async initDefaultData () {
      if (this.isAdminMode) { // 系统视图
        let defaultDomain = { key: this.userInfo.projectDomainId, label: this.userInfo.projectDomain }
        const initialValue = _.get(this.decorators, 'domain[1].initialValue')
        if (R.is(Object, initialValue) && initialValue.key) {
          defaultDomain = { key: initialValue.key, label: initialValue.label }
        } else if (R.is(String, initialValue) && initialValue) {
          defaultDomain = { key: initialValue }
        }
        const projectInitialValue = _.get(this.decorators, 'project[1].initialValue')
        const domainChange = () => {
          this._setInitDomain(defaultDomain)
          this.domainChange(defaultDomain || {})
        }
        if (R.is(Object, projectInitialValue) && projectInitialValue.key) {
          domainChange()
        } else if (R.is(String, projectInitialValue) && projectInitialValue) {
          domainChange()
        } else {
          if (this.isDefaultSelect) {
            domainChange()
          }
        }
        if (this.isDomainFirstLoadData) {
          this.$emit('fetchDomainCallback')
          this.isDomainFirstLoadData = false
        }
        // await this.$nextTick()
        // this.$refs.domain.loadDefaultSelectedOpts()
      } else {
        if (this.isDomainMode) { // 域视图
          const data = [{
            key: this.userInfo.projectDomainId,
            label: this.userInfo.projectDomain,
          }]
          this.domains = data
          this.domainChange(data[0])

          let defaultProject = { key: this.userInfo.projectId, label: this.userInfo.projectName }
          const initialProject = _.get(this.decorators, 'project[1].initialValue')
          if (R.is(Object, initialProject) && initialProject.key) {
            defaultProject = { key: initialProject.key, label: initialProject.label }
          } else if (R.is(String, initialProject) && initialProject) {
            defaultProject = { key: initialProject.key, label: initialProject.label }
          }
          const projectChange = () => {
            this.projectChange(defaultProject || {})
            this._setInitProject(defaultProject || {})
          }
          if (R.is(Object, initialProject) && initialProject.key) {
            projectChange()
          } else if (R.is(String, initialProject) && initialProject) {
            projectChange()
          } else {
            if (this.isDefaultSelect) {
              projectChange()
            }
          }
          if (this.isProjectFirstLoadData) {
            this.$emit('fetchProjectCallback')
            this.isProjectFirstLoadData = false
          }
        } else { // 普通视图
          const data = [{
            key: this.userInfo.projectId,
            label: this.userInfo.projectName,
          }]
          this.projects = data
          // 普通视图下不用判断 isDefaultSelect
          this.projectChange(data[0])
          this._setInitProject(data[0])
        }
      }
    },
    resourceMapTypeChange (e) {
      this.resourceMapType = e.target.value
      if (e.target.value === 'target_project') {
        this.createProjectTarget = 'project'
      }
    },
    createProjectTargetChange (e) {
      this.createProjectTarget = e.target.value
    },
    effectiveScopeChange (e) {
      this.effectiveScope = e.target.value
    },
    openProjectMappingChange (e) {
      this.openProjectMapping = e
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
      this.domainId = domainId
    },
    projectChange (project) {
      const projectId = R.is(Object, project) ? project.key : project
      this.projectData = project
      if (this.labelInValue) {
        this.$emit('update:project', project)
      } else {
        this.$emit('update:project', projectId)
      }
    },
    handleAutoCreateProjectChange (e) {
      const checked = e.target.checked
      this.disableProjectSelect = checked
      this.$bus.$emit('updateAutoCreate', checked)
    },
  },
}
</script>

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
      <a-checkbox-group v-decorator="extraDecorators.resource_map_type" :options="resourceMapTypeOpts" @change="resourceMapTypeChange" />
    </a-form-item>
    <a-form-item v-if="openProjectMapping" :label="$t('cloudenv.text_580')">
      <base-select
        v-decorator="extraDecorators.project_mapping_id"
        resource="project_mappings"
        showSync
        :select-props="{ placeholder: $t('common.tips.select', [$t('cloudenv.text_580')]) }"
        :params="projectMappingParams" />
      <div slot="extra">
        {{$t('cloudenv.no_project_mapping')}}
        <help-link :href="href">{{$t('cloudenv.go_create')}}</help-link>
      </div>
    </a-form-item>
    <a-form-item v-if="openProjectMapping" :label="$t('cloudenv.project_mapping_effective_scope')" :extra="effectiveScopeExtra">
      <a-radio-group v-decorator="extraDecorators.effective_scope" @change="effectiveScopeChange">
        <a-radio-button value="resource">{{$t('cloudenv.resource_tag')}}</a-radio-button>
        <a-radio-button value="project">{{$t('cloudenv.project_tag')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="resourceMapType.length" :label="resourceMapType.length === 1 && resourceMapType.includes('project') ? $t('cloudenv.target_project') : $t('cloudenv.default_project')">
      <base-select
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
    cloneData: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    const initResourceMapType = []
    const initProjectMapping = []
    let initEffectiveScope = ''
    const {
      auto_create_project,
      auto_create_project_for_provider,
      project_mapping_id,
      tenant,
      enable_resource_sync,
      enable_project_sync,
    } = this.cloneData
    if (auto_create_project_for_provider) initResourceMapType.push('cloudprovider')
    if (project_mapping_id) {
      initResourceMapType.push('project_mapping')
      initProjectMapping.push(project_mapping_id)
    }
    if (auto_create_project) initResourceMapType.push('external_project')
    if (tenant) {
      initResourceMapType.push('project')
    }
    if (enable_resource_sync && !initEffectiveScope) {
      initEffectiveScope = 'resource'
    } else if (enable_project_sync && !initEffectiveScope) {
      initEffectiveScope = 'project'
    }
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
            initialValue: initResourceMapType,
            rules: [{ required: true, message: this.$t('cloudenv.select_resource_map_type') }],
          },
        ],
        project_mapping_id: [
          'project_mapping_id',
          {
            initialValue: initProjectMapping,
            rules: [{ required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_580')]) }],
          },
        ],
        effective_scope: [
          'effective_scope',
          {
            initialValue: initEffectiveScope || 'resource',
          },
        ],
      },
      resourceMapType: initResourceMapType,
      openProjectMapping: initResourceMapType.includes('project_mapping'),
      effectiveScope: initEffectiveScope || 'resource',
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
      const { resourceMapType } = this
      if (!resourceMapType.length) return ''
      if (resourceMapType.length === 1) {
        return this.$t(`cloudenv.resource_map_type.${resourceMapType[0]}`)
      }
      if (resourceMapType.includes('project_mapping') && resourceMapType.includes('external_project') && resourceMapType.includes('cloudprovider')) {
        return this.$t('cloudenv.resource_map_type.all')
      }
      if (resourceMapType.includes('project_mapping') && resourceMapType.includes('external_project')) {
        return this.$t('cloudenv.resource_map_type.project_mapping_and_external_project')
      }
      if (resourceMapType.includes('project_mapping') && resourceMapType.includes('cloudprovider')) {
        return this.$t('cloudenv.resource_map_type.project_mapping_and_cloudprovider')
      }
      if (resourceMapType.includes('external_project') && resourceMapType.includes('cloudprovider')) {
        return this.$t('cloudenv.resource_map_type.external_project_and_cloudprovider')
      }
      const types = resourceMapType.filter(key => key !== 'project')
      if (types.length) {
        return this.$t(`cloudenv.resource_map_type.${types[0]}`)
      } else {
        return this.$t('cloudenv.resource_map_type.project')
      }
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
    resourceMapTypeOpts () {
      const ret = [
        { value: 'project_mapping', label: this.$t('cloudenv.belong_to_project.project_mapping') },
        { value: 'external_project', label: this.$t('cloudenv.belong_to_project.external_project') },
        { value: 'cloudprovider', label: this.$t('cloudenv.belong_to_project.cloudprovider') },
        { value: 'project', label: this.$t('cloudenv.target_project') },
      ]
      return ret
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
    resourceMapTypeChange (value) {
      this.resourceMapType = value
      this.openProjectMapping = value.includes('project_mapping')
    },
    effectiveScopeChange (e) {
      this.effectiveScope = e.target.value
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
  },
}
</script>

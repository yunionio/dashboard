<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.set_project_mapping')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('res.cloudaccount')" :count="params.data.length" :action="$t('cloudenv.set_project_mapping')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model
        ref="form"
        class="mt-3"
        :model="fd"
        :rules="rules"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('cloudenv.resource_map_type')" :extra="resourceMapExtra">
          <a-radio-group v-model="fd.resource_map_type" @change="resourceMapTypeChange">
            <a-radio-button value="target_project">{{$t('cloudenv.target_project')}}</a-radio-button>
            <a-radio-button v-if="showAutoCreateProject" value="auto_create_project">{{$t('cloudenv.map_by_cloudproject')}}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item
          :label="fd.resource_map_type === 'target_project' ? $t('cloudenv.cloudaccount.project_mapping') : $t('cloudenv.map_project_is_no_cloudproject')">
          <a-radio-group v-if="fd.resource_map_type === 'auto_create_project'" v-model="fd.create_project_target" @change="createProjectTargetChange">
            <a-radio-button value="project">{{$t('dictionary.project')}}</a-radio-button>
            <a-radio-button value="cloudprovider">{{$t('dictionary.cloudprovider')}}</a-radio-button>
          </a-radio-group>
          <base-select
            v-if="fd.create_project_target === 'project'"
            v-model="fd.project_id"
            resource="projects"
            filterable
            remote
            :params="projectParams" />
        </a-form-model-item>
        <a-form-model-item :label="$t('cloudenv.text_580')" prop="project_mapping_id">
          <a-switch
            v-model="fd.is_open_project_mapping"
            :checkedChildren="$t('cloudenv.text_84')"
            :unCheckedChildren="$t('cloudenv.text_85')"
            @change="openProjectMappingChange" />
          <a-form-model-item>
            <base-select
              v-if="openProjectMapping"
              v-model="fd.project_mapping_id"
              resource="project_mappings"
              :select-props="{ placeholder: $t('common.tips.select', [$t('cloudenv.text_580')]), allowClear: true }"
              :params="projectMappingParams" />
          </a-form-model-item>
        </a-form-model-item>
        <a-form-model-item v-if="fd.is_open_project_mapping" :label="$t('cloudenv.effective_scope')" prop="effective_scope" :extra="effectiveScopeExtra">
          <a-radio-group v-model="fd.effective_scope">
            <a-radio-button value="resource">{{$t('cloudenv.resource_tag')}}</a-radio-button>
            <a-radio-button value="project">{{$t('cloudenv.project_tag')}}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-item :label="$t('cloudenv.block_resources')" v-if="!ignoreBlockedResources">
          <a-switch
            :checkedChildren="$t('cloudenv.text_84')"
            :unCheckedChildren="$t('cloudenv.text_85')"
            v-model="fd.isOpenBlockedResources" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.block_resources_type')" v-if="!ignoreBlockedResources && fd.isOpenBlockedResources">
          <base-select
            v-model="fd.blockedResources"
            :options="BLOCKED_RESOURCES"
            :select-props="{ placeholder: $t('common.tips.select', [$t('cloudenv.block_resources_type')]), allowClear: true, mode: 'multiple' }" />
        </a-form-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { BLOCKED_RESOURCES } from '@Cloudenv/constants'

export default {
  name: 'CloudaccountSetPojectmappingDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    let initResourceTypeMap = 'target_project'
    let initCreateProjectTarget = 'project'
    let initOpenProjectMapping = false
    let initProjectMappingId = ''
    let initEffectiveScope = ''
    let initProjectId = ''
    let initBlockResource = []
    this.params.data.map(item => {
      if (!initProjectMappingId && item.project_mapping_id) {
        initProjectMappingId = item.project_mapping_id
        initOpenProjectMapping = true
      }
      if (item.auto_create_project) {
        initResourceTypeMap = 'auto_create_project'
      }
      if (item.auto_create_project_for_provider) {
        initCreateProjectTarget = 'cloudprovider'
        initResourceTypeMap = 'auto_create_project'
      }
      if (item.tenant_id) {
        initProjectId = item.tenant_id
      }
      if (item.enable_resource_sync && !initEffectiveScope) {
        initEffectiveScope = 'resource'
      } else if (item.enable_project_sync && !initEffectiveScope) {
        initEffectiveScope = 'project'
      }
      if (item.skip_sync_resources) {
        initBlockResource = item.skip_sync_resources
      }
    })
    return {
      BLOCKED_RESOURCES,
      loading: false,
      showAutoCreateProject: true,
      fd: {
        resource_map_type: initResourceTypeMap,
        create_project_target: initCreateProjectTarget,
        project_id: initProjectId,
        is_open_project_mapping: initOpenProjectMapping,
        project_mapping_id: initProjectMappingId,
        effective_scope: initEffectiveScope || 'resource',
        isOpenBlockedResources: initBlockResource?.length > 0,
        blockedResources: initBlockResource || [],
      },
      rules: {
        project_mapping_id: [
          { required: false, message: this.$t('common.tips.select', [this.$t('cloudenv.text_580')]) },
        ],
        blockedResources: [
          { required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.block_resources_type')]) },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  computed: {
    resourceMapExtra () {
      if (this.fd.resource_map_type === 'target_project') {
        if (this.openProjectMapping) {
          return this.$t('cloudenv.resource_map_project_mapping_target_project')
        } else {
          return this.$t('cloudenv.resource_map_target_project')
        }
      } else if (this.fd.resource_map_type === 'auto_create_project') {
        if (this.openProjectMapping) {
          return this.$t('cloudenv.resource_map_project_mapping_cloudproject')
        } else {
          return this.$t('cloudenv.resource_map_cloudproject')
        }
      }
      return ''
    },
    effectiveScopeExtra () {
      if (this.fd.effective_scope === 'resource') {
        return this.$t('cloudenv.resource_tag_tip')
      } else if (this.fd.effective_scope === 'project') {
        return this.$t('cloudenv.project_tag_tip')
      }
      return ''
    },
    projectParams () {
      const { projectParams = {} } = this.params
      return {
        scope: this.$store.getters.scope,
        limit: 20,
        ...projectParams,
      }
    },
    openProjectMapping () {
      return this.fd.is_open_project_mapping
    },
    projectMappingParams () {
      const ret = {
        scope: this.$store.getters.scope,
      }
      if (this.params.data.length === 1) {
        return {
          project_domain: this.params.data[0].domain_id,
        }
      }
      return ret
    },
    isSingle () {
      return this.params.data.length === 1
    },
    ignoreBlockedResources () {
      const { ignoreBlockedResources = false } = this.params
      return ignoreBlockedResources
    },
  },
  methods: {
    genParams () {
      const {
        resource_map_type,
        create_project_target,
        project_id,
        is_open_project_mapping,
        project_mapping_id,
        effective_scope,
        isOpenBlockedResources,
        blockedResources,
      } = this.fd
      const ret = {}
      if (resource_map_type === 'auto_create_project' && create_project_target === 'project') {
        ret.auto_create_project = true
      } else {
        ret.auto_create_project = false
      }
      ret.auto_create_project_for_provider = create_project_target === 'cloudprovider'
      if (project_id && create_project_target !== 'cloudprovider') {
        ret.project_id = project_id
      }
      if (is_open_project_mapping && project_mapping_id) {
        ret.project_mapping_id = project_mapping_id
      }
      if (is_open_project_mapping) {
        if (effective_scope === 'resource') {
          ret.enable_resource_sync = true
          ret.enable_project_sync = false
        } else if (effective_scope === 'project') {
          ret.enable_project_sync = true
          ret.enable_resource_sync = false
        }
      }
      if (!this.ignoreBlockedResources && isOpenBlockedResources) {
        ret.skip_sync_resources = blockedResources
        delete ret.isOpenBlockedResources
        delete ret.blockedResources
      }
      return ret
    },
    createProjectTargetChange (e) {
      this.fd.create_project_target = e.target.value
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.form.validate()
        const { skip_sync_resources, ...data } = this.genParams()
        await this.params.onManager('batchPerformAction', {
          id: this.params.data.map(item => {
            return item.id
          }),
          managerArgs: {
            action: 'project-mapping',
            data,
          },
        })
        if (!this.ignoreBlockedResources) {
          await this.params.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: {
              data: {
                skip_sync_resources: skip_sync_resources || [],
              },
            },
          })
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

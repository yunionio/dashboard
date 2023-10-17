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
        <a-form-model-item :label="$t('cloudenv.resource_map_type')" :extra="resourceMapExtra" prop="resource_map_type">
          <a-checkbox-group v-model="fd.resource_map_type" :options="resourceMapTypeOpts" @change="resourceMapTypeChange" />
        </a-form-model-item>
        <!-- 同步策略 -->
        <a-form-model-item v-if="openProjectMapping" :label="$t('cloudenv.text_580')" prop="project_mapping_id">
          <base-select
            v-model="fd.project_mapping_id"
            resource="project_mappings"
            :select-props="{ placeholder: $t('common.tips.select', [$t('cloudenv.text_580')]), allowClear: true }"
            :params="projectMappingParams" />
        </a-form-model-item>
        <a-form-model-item v-if="openProjectMapping" :label="$t('cloudenv.effective_scope')" prop="effective_scope" :extra="effectiveScopeExtra">
          <a-radio-group v-model="fd.effective_scope">
            <a-radio-button value="resource">{{$t('cloudenv.resource_tag')}}</a-radio-button>
            <a-radio-button value="project">{{$t('cloudenv.project_tag')}}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item
          v-if="fd.resource_map_type.length"
          :label="fd.resource_map_type.length === 1 && fd.resource_map_type.includes('project') ? $t('cloudenv.target_project') : $t('cloudenv.default_project')"
          prop="project_id">
          <base-select
            v-model="fd.project_id"
            resource="projects"
            filterable
            remote
            :params="projectParams" />
        </a-form-model-item>
        <a-form-item :label="$t('cloudenv.block_resources')">
          <a-switch
            :checkedChildren="$t('cloudenv.text_84')"
            :unCheckedChildren="$t('cloudenv.text_85')"
            v-model="fd.isOpenBlockedResources" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.block_resources_type')" v-if="fd.isOpenBlockedResources">
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
import { BLOCKED_RESOURCES } from '@Cloudenv/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudaccountSetPojectmappingDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initResourceMapType = []
    let initProjectMappingId = null
    let initEffectiveScope = ''
    let initProjectId = null
    let initBlockResource = []
    this.params.data.map(item => {
      if (!initProjectMappingId && item.project_mapping_id) {
        initProjectMappingId = item.project_mapping_id
        initResourceMapType.push('project_mapping')
      }
      if (item.auto_create_project) {
        initResourceMapType.push('external_project')
      }
      if (item.auto_create_project_for_provider) {
        initResourceMapType.push('cloudprovider')
      }
      if (item.tenant_id) {
        initProjectId = item.tenant_id
        initResourceMapType.push('project')
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
        resource_map_type: initResourceMapType,
        project_id: initProjectId,
        project_mapping_id: initProjectMappingId,
        effective_scope: initEffectiveScope || 'resource',
        isOpenBlockedResources: initBlockResource?.length > 0,
        blockedResources: initBlockResource || [],
      },
      rules: {
        resource_map_type: [
          { required: true, message: this.$t('cloudenv.select_resource_map_type') },
        ],
        project_mapping_id: [
          { required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_580')]) },
        ],
        blockedResources: [
          { required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.block_resources_type')]) },
        ],
        project_id: [
          { required: true, message: this.$t('rules.project') },
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
    resourceMapTypeOpts () {
      const ret = [
        { value: 'project_mapping', label: this.$t('cloudenv.belong_to_project.project_mapping') },
        { value: 'external_project', label: this.$t('cloudenv.belong_to_project.external_project') },
        { value: 'cloudprovider', label: this.$t('cloudenv.belong_to_project.cloudprovider') },
        { value: 'project', label: this.$t('cloudenv.target_project') },
      ]
      return ret
    },
    resourceMapExtra () {
      const { resource_map_type: resourceMapType } = this.fd
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
      if (this.fd.effective_scope === 'resource') {
        return this.$t('cloudenv.resource_tag_tip')
      } else if (this.fd.effective_scope === 'project') {
        return this.$t('cloudenv.project_tag_tip')
      }
      return ''
    },
    projectParams () {
      return {
        scope: this.$store.getters.scope,
        limit: 20,
      }
    },
    openProjectMapping () {
      return this.fd.resource_map_type.includes('project_mapping')
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
  },
  methods: {
    genParams () {
      const {
        resource_map_type,
        project_id,
        project_mapping_id,
        effective_scope,
        isOpenBlockedResources,
        blockedResources,
      } = this.fd
      const ret = {}
      ret.auto_create_project = resource_map_type.includes('external_project')
      ret.auto_create_project_for_provider = resource_map_type.includes('cloudprovider')
      if (resource_map_type.includes('project_mapping') && project_mapping_id) {
        ret.project_mapping_id = project_mapping_id
      }
      if (resource_map_type.includes('project_mapping')) {
        if (effective_scope === 'resource') {
          ret.enable_resource_sync = true
          ret.enable_project_sync = false
        } else if (effective_scope === 'project') {
          ret.enable_project_sync = true
          ret.enable_resource_sync = false
        }
      }
      if (project_id) {
        ret.project_id = project_id
      }
      if (isOpenBlockedResources) {
        ret.skip_sync_resources = blockedResources
        delete ret.isOpenBlockedResources
        delete ret.blockedResources
      }
      return ret
    },
    resourceMapTypeChange (value) {
      this.resourceMapType = value
      this.openProjectMapping = value.includes('project_mapping')
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
        await this.params.onManager('update', {
          id: this.params.data[0].id,
          managerArgs: {
            data: {
              skip_sync_resources: skip_sync_resources || [],
            },
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

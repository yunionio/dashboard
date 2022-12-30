<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.set_project_mapping')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('cloudenv.text_318')" :count="params.data.length" :action="$t('cloudenv.set_project_mapping')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model
        ref="form"
        :model="fd"
        :rules="rules"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('cloudenv.text_580')" prop="project_mapping_id">
          <base-select
            v-model="fd.project_mapping_id"
            resource="project_mappings"
            :select-props="{ placeholder: $t('common.tips.select', [$t('cloudenv.text_580')]), allowClear: true }"
            :params="projectMappingParams" />
        </a-form-model-item>
        <a-form-model-item :label="$t('cloudenv.effective_scope')" prop="effective_scope" :extra="effectiveScopeExtra">
          <a-radio-group v-model="fd.effective_scope">
            <a-radio-button value="resource">{{$t('cloudenv.resource_tag')}}</a-radio-button>
            <a-radio-button value="project">{{$t('cloudenv.project_tag')}}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
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

export default {
  name: 'CloudproviderSetPojectmappingDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    let initProjectMappingId = ''
    let initEffectiveScope = ''
    this.params.data.map(item => {
      if (!initProjectMappingId && item.project_mapping_id) {
        initProjectMappingId = item.project_mapping_id
      }
      if (item.enable_resource_sync && !initEffectiveScope) {
        initEffectiveScope = 'resource'
      } else if (item.enable_project_sync && !initEffectiveScope) {
        initEffectiveScope = 'project'
      }
    })
    return {
      loading: false,
      discountLoaded: false,
      fd: {
        project_mapping_id: initProjectMappingId,
        effective_scope: initEffectiveScope || 'resource',
      },
      rules: {
        project_mapping_id: [
          { required: false, message: this.$t('common.tips.select', [this.$t('cloudenv.text_580')]) },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    effectiveScopeExtra () {
      if (this.fd.effective_scope === 'resource') {
        return this.$t('cloudenv.resource_tag_tip')
      } else if (this.fd.effective_scope === 'project') {
        return this.$t('cloudenv.project_tag_tip')
      }
      return ''
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
  },
  created () {
  },
  methods: {
    genParams () {
      const ret = { project_mapping_id: this.fd.project_mapping_id }
      if (this.fd.effective_scope === 'resource') {
        ret.enable_resource_sync = true
        ret.enable_project_sync = false
      }
      if (this.fd.effective_scope === 'project') {
        ret.enable_project_sync = true
        ret.enable_resource_sync = false
      }
      return ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.form.validate()
        const data = this.genParams()
        const bindedIds = []
        this.params.data.map(item => {
          if (item.project_mapping_id) {
            bindedIds.push(item.id)
          }
        })
        if (bindedIds.length) {
          await this.params.onManager('batchPerformAction', {
            id: bindedIds,
            managerArgs: {
              action: 'project-mapping',
              data: {},
            },
          })
        }
        await this.params.onManager('batchPerformAction', {
          id: this.params.data.map(item => {
            return item.id
          }),
          managerArgs: {
            action: 'project-mapping',
            data,
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

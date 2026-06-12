<template>
  <base-dialog :width="720" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item v-if="params.type !== 'edit'" :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.ai_provider_id')" prop="ai_provider_id">
          <base-select
            v-model="form.ai_provider_id"
            resource="ai_providers"
            :params="aiproxySelectParams('ai_providers')"
            filterable
            version="v2"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.aiproxy.provider')]) }" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.model_key')" prop="model_key">
          <a-input v-model="form.model_key" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'
import { getAiproxySelectParams } from '@Ai/constants/aiproxyResources'

export default {
  name: 'AiModelFormDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? (this.params.data[0] || {}) : {}
    return {
      loading: false,
      form: {
        generate_name: '',
        ai_provider_id: data.ai_provider_id || '',
        model_key: data.model_key || '',
      },
      rules: {
        generate_name: this.params.type === 'edit' ? [] : [{ required: true, validator: this.$validate('resourceName') }],
        ai_provider_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.aiproxy.provider')]) }],
        model_key: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.model_key')]) }],
      },
    }
  },
  methods: {
    aiproxySelectParams (resource, extra) {
      return getAiproxySelectParams(this, resource, extra)
    },
    async handleConfirm () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        const data = {
          ai_provider_id: this.form.ai_provider_id,
          model_key: this.form.model_key,
        }
        if (this.params.type === 'edit') {
          await this.params.onManager('update', { id: this.params.data[0].id, managerArgs: { data } })
        } else {
          data.generate_name = this.form.generate_name
          await this.params.onManager('create', { managerArgs: { data } })
        }
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

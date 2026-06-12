<template>
  <base-dialog :width="760" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item v-if="params.type !== 'edit'" :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item v-if="!fixedProviderId" :label="$t('aice.aiproxy.ai_provider_id')" prop="ai_provider_id">
          <base-select
            v-model="form.ai_provider_id"
            resource="ai_providers"
            :params="aiproxySelectParams('ai_providers')"
            filterable
            version="v2" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.secret')" prop="secret">
          <a-input-password v-model="form.secret" :placeholder="params.type === 'edit' ? $t('aice.aiproxy.leave_blank_to_keep') : ''" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.weight')" prop="weight">
          <a-input-number v-model="form.weight" :min="0" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.allowed_model_keys')">
          <a-select v-model="form.allowed_model_keys" mode="tags" :token-separators="[',']" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.blocked_model_keys')">
          <a-select v-model="form.blocked_model_keys" mode="tags" :token-separators="[',']" />
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
  name: 'AiKeyFormDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? (this.params.data[0] || {}) : {}
    const fixedProviderId = this.params.ai_provider_id || ''
    return {
      loading: false,
      fixedProviderId,
      form: {
        generate_name: '',
        ai_provider_id: data.ai_provider_id || fixedProviderId,
        secret: '',
        weight: data.weight || 0,
        allowed_model_keys: data.routing?.allowed_model_keys || [],
        blocked_model_keys: data.routing?.blocked_model_keys || [],
      },
      rules: {
        generate_name: this.params.type === 'edit' ? [] : [{ required: true, validator: this.$validate('resourceName') }],
        ai_provider_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.aiproxy.provider')]) }],
        secret: this.params.type === 'edit' ? [] : [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.secret')]) }],
      },
    }
  },
  methods: {
    aiproxySelectParams (resource, extra) {
      return getAiproxySelectParams(this, resource, extra)
    },
    buildPayload () {
      const routing = {}
      if (this.form.allowed_model_keys?.length) routing.allowed_model_keys = this.form.allowed_model_keys
      if (this.form.blocked_model_keys?.length) routing.blocked_model_keys = this.form.blocked_model_keys
      const data = {
        ai_provider_id: this.form.ai_provider_id,
        weight: this.form.weight,
        routing: Object.keys(routing).length ? routing : undefined,
      }
      if (this.form.secret) data.secret = this.form.secret
      if (this.params.type !== 'edit') data.generate_name = this.form.generate_name
      return data
    },
    async handleConfirm () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        const data = this.buildPayload()
        if (this.params.type === 'edit') {
          await this.params.onManager('update', { id: this.params.data[0].id, managerArgs: { data } })
        } else {
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

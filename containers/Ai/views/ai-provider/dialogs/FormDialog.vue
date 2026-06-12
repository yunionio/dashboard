<template>
  <base-dialog :width="720" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item v-if="params.type !== 'edit'" :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item v-else :label="$t('common.name')">
          <span>{{ form.name }}</span>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.provider_key')" prop="provider_key">
          <a-auto-complete
            v-model="form.provider_key"
            :data-source="providerKeys"
            :placeholder="$t('common.tips.input', [$t('aice.aiproxy.provider_key')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.base_url')" prop="base_url">
          <a-input v-model="form.base_url" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.api_key_field')" prop="api_key">
          <a-input-password v-model="form.api_key" :placeholder="params.type === 'edit' ? $t('aice.aiproxy.leave_blank_to_keep') : ''" />
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
import { AIPROXY_PROVIDER_KEYS } from '@Ai/constants/aiproxyProviderKeys'

export default {
  name: 'AiProviderFormDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? (this.params.data[0] || {}) : {}
    return {
      loading: false,
      providerKeys: AIPROXY_PROVIDER_KEYS,
      form: {
        name: data.name,
        generate_name: '',
        provider_key: data.provider_key || '',
        base_url: data.config?.base_url || '',
        api_key: '',
      },
      rules: {
        generate_name: this.params.type === 'edit' ? [] : [{ required: true, validator: this.$validate('resourceName') }],
        provider_key: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.provider_key')]) }],
      },
    }
  },
  methods: {
    buildPayload () {
      const config = {}
      if (this.form.base_url) config.base_url = this.form.base_url
      if (this.form.api_key) config.api_key = this.form.api_key
      const payload = {
        provider_key: this.form.provider_key,
      }
      if (Object.keys(config).length) payload.config = config
      if (this.params.type !== 'edit') payload.generate_name = this.form.generate_name
      return payload
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

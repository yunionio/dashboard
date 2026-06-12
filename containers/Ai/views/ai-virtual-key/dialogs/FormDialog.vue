<template>
  <base-dialog :width="760" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item v-if="params.type !== 'edit'" :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item v-if="params.type === 'edit'" :label="$t('aice.aiproxy.virtual_key_field')" prop="virtual_key">
          <a-input v-model="form.virtual_key" :placeholder="$t('aice.aiproxy.optional_auto_generate')" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.max_tokens_per_request')">
          <a-input-number v-model="form.max_tokens_per_request" :min="0" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.requests_per_minute')">
          <a-input-number v-model="form.requests_per_minute" :min="0" />
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

export default {
  name: 'AiVirtualKeyFormDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? (this.params.data[0] || {}) : {}
    return {
      loading: false,
      form: {
        generate_name: '',
        virtual_key: data.virtual_key || '',
        max_tokens_per_request: data.limits?.max_tokens_per_request || undefined,
        requests_per_minute: data.limits?.requests_per_minute || undefined,
      },
      rules: {
        generate_name: this.params.type === 'edit' ? [] : [{ required: true, validator: this.$validate('resourceName') }],
      },
    }
  },
  methods: {
    buildPayload () {
      const limits = {}
      if (this.form.max_tokens_per_request) limits.max_tokens_per_request = this.form.max_tokens_per_request
      if (this.form.requests_per_minute) limits.requests_per_minute = this.form.requests_per_minute
      const data = { limits: Object.keys(limits).length ? limits : undefined }
      if (this.params.type === 'edit' && this.form.virtual_key) data.virtual_key = this.form.virtual_key
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

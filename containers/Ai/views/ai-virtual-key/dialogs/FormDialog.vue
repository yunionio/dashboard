<template>
  <base-dialog :width="760" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item v-if="params.type !== 'edit'" :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.max_tokens_per_request')" :extra="$t('aice.aiproxy.limit_unlimited_hint')">
          <a-input-number v-model="form.max_tokens_per_request" :min="0" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.requests_per_minute')" :extra="$t('aice.aiproxy.limit_unlimited_hint')">
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
        max_tokens_per_request: data.limits?.max_tokens_per_request || undefined,
        requests_per_minute: data.limits?.requests_per_minute || undefined,
      },
      rules: {
        generate_name: this.params.type === 'edit' ? [] : [{ required: true, validator: this.$validate('resourceName') }],
      },
    }
  },
  methods: {
    positiveLimit (val) {
      const n = Number(val)
      return Number.isFinite(n) && n > 0 ? n : 0
    },
    buildLimitsPayload ({ always = false } = {}) {
      const maxTokens = this.positiveLimit(this.form.max_tokens_per_request)
      const rpm = this.positiveLimit(this.form.requests_per_minute)
      const limits = {}
      if (this.params.type === 'edit') {
        const prev = (this.params.data[0] && this.params.data[0].limits) || {}
        if (Array.isArray(prev.allowed_ai_provider_ids) && prev.allowed_ai_provider_ids.length) {
          limits.allowed_ai_provider_ids = prev.allowed_ai_provider_ids
        }
      }
      if (maxTokens > 0) limits.max_tokens_per_request = maxTokens
      else if (always) limits.max_tokens_per_request = 0
      if (rpm > 0) limits.requests_per_minute = rpm
      else if (always) limits.requests_per_minute = 0
      if (always) return limits
      return Object.keys(limits).length ? limits : undefined
    },
    buildPayload () {
      const isEdit = this.params.type === 'edit'
      const data = {
        // edit must always send limits so clearing (0 / empty) replaces the stored JSON
        limits: this.buildLimitsPayload({ always: isEdit }),
      }
      if (!isEdit) data.generate_name = this.form.generate_name
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

<template>
  <div>
    <page-header :title="$t('common.create') + $t('aice.aiproxy.virtual_key')" />
    <page-body needMarginBottom>
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" class="mt-4">
        <a-form-model-item :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.virtual_key_field')">
          <a-input v-model="form.virtual_key" :placeholder="$t('aice.aiproxy.optional_auto_generate')" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.max_tokens_per_request')">
          <a-input-number v-model="form.max_tokens_per_request" :min="0" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.requests_per_minute')">
          <a-input-number v-model="form.requests_per_minute" :min="0" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.allowed_ai_provider_ids')">
          <base-select v-model="form.allowed_ai_provider_ids" resource="ai_providers" :params="aiproxySelectParams('ai_providers')" filterable version="v2" multiple />
        </a-form-model-item>
      </a-form-model>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.create') }}</a-button>
        <a-button class="ml-2" @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import { validateModelForm } from '@/utils/validate'
import { getAiproxySelectParams } from '@Ai/constants/aiproxyResources'

export default {
  name: 'AiVirtualKeyCreate',
  data () {
    return {
      loading: false,
      form: {
        generate_name: '',
        virtual_key: '',
        max_tokens_per_request: undefined,
        requests_per_minute: undefined,
        allowed_ai_provider_ids: [],
      },
      rules: {
        generate_name: [{ required: true, validator: this.$validate('resourceName') }],
      },
    }
  },
  methods: {
    aiproxySelectParams (resource, extra) {
      return getAiproxySelectParams(this, resource, extra)
    },
    handleCancel () { this.$router.push('/ai-virtual-key') },
    async handleSubmit () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        const limits = {}
        if (this.form.max_tokens_per_request) limits.max_tokens_per_request = this.form.max_tokens_per_request
        if (this.form.requests_per_minute) limits.requests_per_minute = this.form.requests_per_minute
        if (this.form.allowed_ai_provider_ids?.length) limits.allowed_ai_provider_ids = this.form.allowed_ai_provider_ids
        await new this.$Manager('ai_virtual_keys').create({
          data: {
            generate_name: this.form.generate_name,
            virtual_key: this.form.virtual_key || undefined,
            limits: Object.keys(limits).length ? limits : undefined,
          },
        })
        this.handleCancel()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

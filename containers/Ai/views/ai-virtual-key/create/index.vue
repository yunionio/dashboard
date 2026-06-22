<template>
  <div>
    <page-header :title="$t('common.create') + $t('aice.aiproxy.virtual_key')" />
    <page-body needMarginBottom>
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" class="mt-4">
        <a-form-model-item :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.max_tokens_per_request')">
          <a-input-number v-model="form.max_tokens_per_request" :min="0" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.requests_per_minute')">
          <a-input-number v-model="form.requests_per_minute" :min="0" />
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

export default {
  name: 'AiVirtualKeyCreate',
  data () {
    return {
      loading: false,
      form: {
        generate_name: '',
        max_tokens_per_request: undefined,
        requests_per_minute: undefined,
      },
      rules: {
        generate_name: [{ required: true, validator: this.$validate('resourceName') }],
      },
    }
  },
  methods: {
    handleCancel () { this.$router.push('/ai-virtual-key') },
    async handleSubmit () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        const limits = {}
        if (this.form.max_tokens_per_request) limits.max_tokens_per_request = this.form.max_tokens_per_request
        if (this.form.requests_per_minute) limits.requests_per_minute = this.form.requests_per_minute
        await new this.$Manager('ai_virtual_keys').create({
          data: {
            generate_name: this.form.generate_name,
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

<template>
  <div>
    <page-header :title="$t('common.create') + $t('aice.aiproxy.provider')" />
    <page-body needMarginBottom>
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" class="mt-4">
        <a-form-model-item :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.provider_key')" prop="provider_key">
          <a-auto-complete v-model="form.provider_key" :data-source="providerKeys" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.base_url')" prop="base_url">
          <a-input v-model="form.base_url" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.api_key_field')" prop="api_key">
          <a-input-password v-model="form.api_key" />
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
import { AIPROXY_PROVIDER_KEYS } from '@Ai/constants/aiproxyProviderKeys'

export default {
  name: 'AiProviderCreate',
  data () {
    return {
      loading: false,
      providerKeys: AIPROXY_PROVIDER_KEYS,
      form: {
        generate_name: '',
        provider_key: '',
        base_url: '',
        api_key: '',
      },
      rules: {
        generate_name: [{ required: true, validator: this.$validate('resourceName') }],
        provider_key: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.provider_key')]) }],
      },
    }
  },
  methods: {
    handleCancel () {
      this.$router.push('/ai-provider')
    },
    async handleSubmit () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        const config = {}
        if (this.form.base_url) config.base_url = this.form.base_url
        if (this.form.api_key) config.api_key = this.form.api_key
        await new this.$Manager('ai_providers').create({
          data: {
            generate_name: this.form.generate_name,
            provider_key: this.form.provider_key,
            config: Object.keys(config).length ? config : undefined,
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

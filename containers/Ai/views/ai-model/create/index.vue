<template>
  <div>
    <page-header :title="$t('common.create') + $t('aice.aiproxy.model')" />
    <page-body needMarginBottom>
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" class="mt-4">
        <a-form-model-item :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.ai_provider_id')" prop="ai_provider_id">
          <base-select
            v-model="form.ai_provider_id"
            resource="ai_providers"
            :params="aiproxySelectParams('ai_providers')"
            filterable
            version="v2" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.model_key')" prop="model_key">
          <a-input v-model="form.model_key" />
        </a-form-model-item>
        <a-divider orientation="left">{{ $t('aice.aiproxy.visual') }}</a-divider>
        <a-form-model-item :label="$t('aice.aiproxy.visual_enabled')">
          <a-switch v-model="form.visual_enabled" />
        </a-form-model-item>
        <template v-if="form.visual_enabled">
          <a-form-model-item :label="$t('aice.aiproxy.visual_provider_id')" prop="visual_provider_id">
            <base-select
              v-model="form.visual_provider_id"
              resource="ai_providers"
              :params="aiproxySelectParams('ai_providers')"
              filterable
              version="v2" />
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.aiproxy.visual_model_key')" prop="visual_model_key">
            <a-select
              v-model="form.visual_model_key"
              show-search
              allow-clear
              :options="visualModelKeyOptions"
              :placeholder="$t('common.tips.select', [$t('aice.aiproxy.visual_model_key')])"
              :disabled="!form.visual_provider_id"
              :filter-option="filterOption" />
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.aiproxy.visual_max_rounds')">
            <a-input-number v-model="form.max_rounds" :min="1" placeholder="4" />
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.aiproxy.visual_max_tokens')">
            <a-input-number v-model="form.max_tokens" :min="1" placeholder="2048" />
          </a-form-model-item>
        </template>
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
import { fetchProviderModelKeyOptions } from '@Ai/utils/aiModelNames'

export default {
  name: 'AiModelCreate',
  data () {
    return {
      loading: false,
      visualModelKeyOptions: [],
      form: {
        generate_name: '',
        ai_provider_id: '',
        model_key: '',
        visual_enabled: false,
        visual_provider_id: '',
        visual_model_key: '',
        max_rounds: undefined,
        max_tokens: undefined,
      },
      rules: {
        generate_name: [{ required: true, validator: this.$validate('resourceName') }],
        ai_provider_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.aiproxy.provider')]) }],
        model_key: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.model_key')]) }],
        visual_provider_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.aiproxy.visual_provider_id')]) }],
        visual_model_key: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.aiproxy.visual_model_key')]) }],
      },
    }
  },
  watch: {
    'form.visual_enabled' (enabled) {
      if (enabled) this.loadVisualModelKeyOptions()
      else this.visualModelKeyOptions = []
    },
    'form.visual_provider_id' (providerId, prev) {
      if (providerId !== prev) {
        if (prev) this.form.visual_model_key = ''
        this.loadVisualModelKeyOptions()
      }
    },
  },
  methods: {
    aiproxySelectParams (resource, extra) {
      return getAiproxySelectParams(this, resource, extra)
    },
    filterOption (input, option) {
      const label = option.componentOptions?.children?.[0]?.text || option.label || ''
      return String(label).toLowerCase().includes(String(input || '').toLowerCase())
    },
    async loadVisualModelKeyOptions () {
      const providerId = this.form.visual_provider_id
      if (!providerId) {
        this.visualModelKeyOptions = []
        return
      }
      this.visualModelKeyOptions = await fetchProviderModelKeyOptions(providerId, { vm: this })
    },
    handleCancel () { this.$router.push('/ai-model') },
    buildPayload () {
      const visual = { enabled: !!this.form.visual_enabled }
      if (this.form.max_rounds > 0) visual.max_rounds = this.form.max_rounds
      if (this.form.max_tokens > 0) visual.max_tokens = this.form.max_tokens
      const data = {
        generate_name: this.form.generate_name,
        ai_provider_id: this.form.ai_provider_id,
        model_key: this.form.model_key,
        config: { extensions: { visual } },
      }
      if (this.form.visual_enabled) {
        data.visual_provider_id = this.form.visual_provider_id
        data.visual_model_key = this.form.visual_model_key
      }
      return data
    },
    async handleSubmit () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        await new this.$Manager('ai_models').create({ data: this.buildPayload() })
        this.handleCancel()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

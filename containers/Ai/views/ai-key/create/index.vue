<template>
  <div>
    <page-header :title="$t('common.create') + $t('aice.aiproxy.api_key')" />
    <page-body needMarginBottom>
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" class="mt-4">
        <a-form-model-item :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.ai_provider_id')" prop="ai_provider_id">
          <base-select v-model="form.ai_provider_id" resource="ai_providers" :params="aiproxySelectParams('ai_providers')" filterable version="v2" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.secret')" prop="secret">
          <a-input-password v-model="form.secret" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.weight')">
          <a-input-number v-model="form.weight" :min="0" />
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
  name: 'AiKeyCreate',
  data () {
    return {
      loading: false,
      form: {
        generate_name: '',
        ai_provider_id: '',
        secret: '',
        weight: 0,
      },
      rules: {
        generate_name: [{ required: true, validator: this.$validate('resourceName') }],
        ai_provider_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.aiproxy.provider')]) }],
        secret: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.secret')]) }],
      },
    }
  },
  methods: {
    aiproxySelectParams (resource, extra) {
      return getAiproxySelectParams(this, resource, extra)
    },
    handleCancel () { this.$router.push('/ai-key') },
    async handleSubmit () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        await new this.$Manager('ai_keys').create({
          data: {
            generate_name: this.form.generate_name,
            ai_provider_id: this.form.ai_provider_id,
            secret: this.form.secret,
            weight: this.form.weight,
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

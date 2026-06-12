<template>
  <div>
    <page-header :title="$t('common.create') + $t('aice.aiproxy.proxy_node')" />
    <page-body needMarginBottom>
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" class="mt-4">
        <a-form-model-item :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" :placeholder="$t('common.placeholder')" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.address')" prop="address">
          <a-input v-model="form.address" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.domain')" prop="domain">
          <a-input v-model="form.domain" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.hb_timeout')" prop="hb_timeout">
          <a-input-number v-model="form.hb_timeout" :min="1" />
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
  name: 'AiProxyNodeCreate',
  data () {
    return {
      loading: false,
      form: {
        generate_name: '',
        address: '',
        domain: '',
        hb_timeout: 60,
      },
      rules: {
        generate_name: [{ required: true, validator: this.$validate('resourceName') }],
        address: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.address')]) }],
      },
    }
  },
  methods: {
    handleCancel () {
      this.$router.push('/ai-proxy-node')
    },
    async handleSubmit () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        await new this.$Manager('ai_proxy_nodes').create({ data: this.form })
        this.handleCancel()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

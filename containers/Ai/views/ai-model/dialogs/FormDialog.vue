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
            version="v2"
            :select-props="{ placeholder: $t('common.tips.select', [$t('aice.aiproxy.provider')]) }" />
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
              version="v2"
              :select-props="{ placeholder: $t('common.tips.select', [$t('aice.aiproxy.provider')]) }" />
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
import { fetchProviderModelKeyOptions } from '@Ai/utils/aiModelNames'

function visualFromData (data = {}) {
  const visual = data.config?.extensions?.visual || {}
  return {
    visual_enabled: !!visual.enabled,
    visual_provider_id: data.visual_provider_id || '',
    visual_model_key: data.visual_model_key || '',
    max_rounds: visual.max_rounds || undefined,
    max_tokens: visual.max_tokens || undefined,
  }
}

export default {
  name: 'AiModelFormDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? (this.params.data[0] || {}) : {}
    const fixedProviderId = this.params.ai_provider_id || ''
    return {
      loading: false,
      fixedProviderId,
      visualModelKeyOptions: [],
      form: {
        generate_name: '',
        ai_provider_id: data.ai_provider_id || fixedProviderId,
        model_key: data.model_key || '',
        ...visualFromData(data),
      },
      rules: {
        generate_name: this.params.type === 'edit' ? [] : [{ required: true, validator: this.$validate('resourceName') }],
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
  created () {
    if (this.form.visual_enabled && this.form.visual_provider_id) {
      this.loadVisualModelKeyOptions()
    }
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
    buildPayload () {
      const visual = { enabled: !!this.form.visual_enabled }
      if (this.form.max_rounds > 0) visual.max_rounds = this.form.max_rounds
      if (this.form.max_tokens > 0) visual.max_tokens = this.form.max_tokens
      const data = {
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
    async handleConfirm () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        const data = this.buildPayload()
        if (this.params.type === 'edit') {
          await this.params.onManager('update', { id: this.params.data[0].id, managerArgs: { data } })
        } else {
          data.generate_name = this.form.generate_name
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

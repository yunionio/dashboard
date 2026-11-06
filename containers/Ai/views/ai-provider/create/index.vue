<template>
  <div>
    <page-header :title="$t('common.create') + $t('aice.aiproxy.provider')" />
    <page-body needMarginBottom>
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" class="mt-4">
        <a-form-model-item :label="$t('aice.aiproxy.provider_type')">
          <a-radio-group v-model="form.provider_type" :options="providerTypeOptions" />
        </a-form-model-item>
        <a-form-model-item :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <template v-if="isBuiltin">
          <a-form-model-item :label="$t('aice.aiproxy.provider_key')" prop="provider_key">
            <aiproxy-provider-key-auto-complete
              v-model="form.provider_key"
              :placeholder="$t('common.tips.input', [$t('aice.aiproxy.provider_key')])" />
          </a-form-model-item>
          <template v-if="showBuiltinProviderConfig">
            <a-form-model-item v-if="showApiMode" :label="$t('aice.aiproxy.api_mode')">
              <a-select v-model="form.api_mode" :options="apiModeOptions" />
            </a-form-model-item>
            <a-form-model-item v-if="showMoonshotRegion" :label="$t('aice.aiproxy.moonshot_region')">
              <a-radio-group v-model="form.moonshot_region" :options="moonshotRegionOptions" />
            </a-form-model-item>
            <a-form-model-item v-if="showMoonshotRegion" :label="$t('aice.aiproxy.api_url')">
              <a-input :value="form.base_url" readonly />
            </a-form-model-item>
            <a-form-model-item v-if="showBaseUrl" :label="$t('aice.aiproxy.api_url')" prop="base_url">
              <a-input v-model="form.base_url" />
            </a-form-model-item>
            <a-form-model-item :label="$t('aice.aiproxy.api_key_field')" prop="api_key">
              <a-input-password v-model="form.api_key" />
            </a-form-model-item>
          </template>
        </template>
        <template v-else>
          <a-form-model-item :label="$t('aice.aiproxy.api_mode')">
            <a-select v-model="form.api_mode" :options="apiModeOptions" />
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.aiproxy.api_url')" prop="base_url" :required="isCustom">
            <a-input v-model="form.base_url" :placeholder="baseUrlPlaceholder" />
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.aiproxy.api_key_field')" prop="api_key">
            <a-input-password v-model="form.api_key" />
          </a-form-model-item>
        </template>
        <a-form-model-item v-if="connectivityTested" :label="$t('aice.aiproxy.model_key')" required>
          <a-input
            v-model="modelSearch"
            allow-clear
            :placeholder="$t('common.search')"
            class="mb-2" />
          <div class="provider-model-list">
            <a-table
              v-if="filteredModelRows.length"
              size="small"
              :pagination="false"
              :row-key="row => row.model_key"
              :columns="modelColumns"
              :data-source="filteredModelRows"
              :row-selection="rowSelection"
              :scroll="{ y: 280 }" />
            <div v-else class="provider-model-list-empty">
              {{ emptyModelListText }}
            </div>
          </div>
          <a-alert
            v-if="modelsSource === 'catalog'"
            type="info"
            show-icon
            :message="$t('aice.aiproxy.connectivity_models_catalog_hint')"
            class="mt-2 mb-0" />
        </a-form-model-item>
        <a-alert
          v-if="!connectivityTested"
          type="info"
          show-icon
          :message="$t('aice.aiproxy.connectivity_models_hint')"
          class="mb-0" />
      </a-form-model>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="loading" :disabled="createDisabled" @click="handleSubmit">{{ $t('common.create') }}</a-button>
        <test-button class="ml-2" :post="testPost" :disabled="testConnectivityDisabled" :is-success-alert="false" />
        <a-button class="ml-2" @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import { validateModelForm } from '@/utils/validate'
import TestButton from '@/sections/TestButton'
import AiproxyProviderKeyAutoComplete from '@Ai/components/AiproxyProviderKeyAutoComplete'
import { getApiModeOptions, supportsDualAPIMode } from '@Ai/utils/aiproxyProviderApiMode'
import { getDefaultPublicBaseURL, shouldShowBuiltinBaseURL } from '@Ai/utils/aiproxyProviderDefaults'
import {
  MOONSHOT_REGION_CN,
  getMoonshotBaseURL,
  getMoonshotRegionOptions,
  isMoonshotProviderKey,
} from '@Ai/utils/aiproxyMoonshotRegion'
import {
  CUSTOM_PROVIDER_KEY,
  PROVIDER_TYPE_BUILTIN,
  PROVIDER_TYPE_CUSTOM,
  getProviderTypeOptions,
  isCustomProviderKey,
} from '@Ai/utils/aiproxyProviderTypes'

export default {
  name: 'AiProviderCreate',
  components: { AiproxyProviderKeyAutoComplete, TestButton },
  data () {
    return {
      loading: false,
      connectivityTested: false,
      modelsSource: '',
      availableModels: [],
      selectedModelKeys: [],
      modelMeta: {},
      modelSearch: '',
      form: {
        provider_type: PROVIDER_TYPE_BUILTIN,
        generate_name: '',
        provider_key: '',
        api_mode: 'openai',
        base_url: '',
        moonshot_region: MOONSHOT_REGION_CN,
        api_key: '',
      },
      rules: {
        generate_name: [{ required: true, validator: this.$validate('resourceName') }],
        provider_key: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.provider_key')]) }],
        api_key: [{
          validator: (rule, value, callback) => {
            if (this.isBuiltin && !this.showBuiltinProviderConfig) return callback()
            if (!String(value || '').trim()) {
              return callback(new Error(this.$t('common.tips.input', [this.$t('aice.aiproxy.api_key_field')])))
            }
            callback()
          },
          trigger: 'blur',
        }],
        base_url: [{
          validator: (rule, value, callback) => {
            if (!this.isCustom) return callback()
            if (!String(value || '').trim()) {
              return callback(new Error(this.$t('common.tips.input', [this.$t('aice.aiproxy.api_url')])))
            }
            callback()
          },
          trigger: 'blur',
        }],
      },
    }
  },
  computed: {
    providerTypeOptions () {
      return getProviderTypeOptions(this)
    },
    isBuiltin () {
      return this.form.provider_type === PROVIDER_TYPE_BUILTIN
    },
    isCustom () {
      return this.form.provider_type === PROVIDER_TYPE_CUSTOM
    },
    effectiveProviderKey () {
      return this.isCustom ? CUSTOM_PROVIDER_KEY : this.form.provider_key
    },
    showBuiltinProviderConfig () {
      return this.isBuiltin && Boolean(String(this.form.provider_key || '').trim())
    },
    showApiMode () {
      return this.showBuiltinProviderConfig && supportsDualAPIMode(this.form.provider_key)
    },
    showBaseUrl () {
      return this.showBuiltinProviderConfig && shouldShowBuiltinBaseURL(this.form.provider_key)
    },
    showMoonshotRegion () {
      return this.showBuiltinProviderConfig && isMoonshotProviderKey(this.form.provider_key)
    },
    moonshotRegionOptions () {
      return getMoonshotRegionOptions(this)
    },
    apiModeOptions () {
      return getApiModeOptions(this)
    },
    baseUrlPlaceholder () {
      return this.form.api_mode === 'anthropic'
        ? 'https://api.example.com/anthropic'
        : 'https://api.example.com/v1'
    },
    testConnectivityDisabled () {
      if (!String(this.form.api_key || '').trim()) return true
      if (this.isCustom && !String(this.form.base_url || '').trim()) return true
      if (this.isBuiltin && !this.showBuiltinProviderConfig) return true
      return false
    },
    filteredModelRows () {
      const q = String(this.modelSearch || '').trim().toLowerCase()
      return this.availableModels
        .filter(item => !q || String(item.model_key).toLowerCase().includes(q))
        .map(item => ({
          model_key: item.model_key,
          ...(this.modelMeta[item.model_key] || { context_window: item.context_window, vision: false }),
        }))
    },
    modelColumns () {
      return [
        {
          title: this.$t('aice.aiproxy.model_key'),
          dataIndex: 'model_key',
          key: 'model_key',
          ellipsis: true,
        },
        {
          title: this.$t('aice.aiproxy.context_window'),
          key: 'context_window',
          width: 160,
          customRender: (text, row) => (
            <a-input-number
              value={this.modelMeta[row.model_key]?.context_window}
              min={0}
              step={1024}
              style="width: 100%"
              onChange={val => this.updateModelMeta(row.model_key, 'context_window', val)}
            />
          ),
        },
        {
          title: this.$t('aice.aiproxy.capability_vision'),
          key: 'vision',
          width: 100,
          align: 'center',
          customRender: (text, row) => (
            <a-checkbox
              checked={!!this.modelMeta[row.model_key]?.vision}
              onChange={e => this.updateModelMeta(row.model_key, 'vision', e.target.checked)}
            />
          ),
        },
      ]
    },
    rowSelection () {
      return {
        selectedRowKeys: this.selectedModelKeys,
        onChange: keys => {
          this.selectedModelKeys = keys
        },
      }
    },
    emptyModelListText () {
      if (String(this.modelSearch || '').trim() && this.availableModels.length) {
        return this.$t('aice.aiproxy.set_models_search_empty')
      }
      return this.$t('aice.aiproxy.set_models_none')
    },
    createDisabled () {
      return !this.connectivityTested || this.selectedModelKeys.length < 1
    },
  },
  watch: {
    'form.provider_key' (key) {
      this.resetConnectivityState()
      if (this.isBuiltin) {
        if (isMoonshotProviderKey(key)) {
          this.form.moonshot_region = MOONSHOT_REGION_CN
          this.form.base_url = getMoonshotBaseURL(MOONSHOT_REGION_CN)
        } else {
          this.form.moonshot_region = MOONSHOT_REGION_CN
          this.form.base_url = getDefaultPublicBaseURL(key)
        }
      }
    },
    'form.moonshot_region' (region) {
      if (!this.showMoonshotRegion) return
      this.form.base_url = getMoonshotBaseURL(region)
      this.resetConnectivityState()
    },
    'form.api_key' () {
      this.resetConnectivityState()
    },
    'form.base_url' () {
      this.resetConnectivityState()
    },
    'form.api_mode' () {
      this.resetConnectivityState()
    },
    'form.provider_type' (type) {
      this.resetConnectivityState()
      if (type === PROVIDER_TYPE_CUSTOM) {
        this.form.provider_key = CUSTOM_PROVIDER_KEY
        return
      }
      if (isCustomProviderKey(this.form.provider_key)) {
        this.form.provider_key = ''
      }
    },
  },
  methods: {
    resetConnectivityState () {
      this.connectivityTested = false
      this.modelsSource = ''
      this.availableModels = []
      this.selectedModelKeys = []
      this.modelMeta = {}
      this.modelSearch = ''
    },
    updateModelMeta (modelKey, field, value) {
      const prev = this.modelMeta[modelKey] || { context_window: undefined, vision: false }
      this.$set(this.modelMeta, modelKey, {
        ...prev,
        [field]: value,
      })
    },
    applyConnectivityTestResult (data, preserveSelection = false) {
      const models = Array.isArray(data?.models) ? data.models : []
      this.modelsSource = data?.models_source || ''
      this.availableModels = models
        .map(item => ({
          model_key: String(item?.model_key || '').trim(),
          context_window: item?.context_window > 0 ? item.context_window : undefined,
        }))
        .filter(item => item.model_key)
      const nextMeta = { ...this.modelMeta }
      this.availableModels.forEach(item => {
        if (!nextMeta[item.model_key]) {
          nextMeta[item.model_key] = { context_window: item.context_window, vision: false }
        } else if (!nextMeta[item.model_key].context_window && item.context_window) {
          nextMeta[item.model_key] = {
            ...nextMeta[item.model_key],
            context_window: item.context_window,
          }
        }
      })
      this.modelMeta = nextMeta
      const keys = this.availableModels.map(item => item.model_key)
      if (preserveSelection && this.selectedModelKeys.length) {
        const kept = this.selectedModelKeys.filter(key => keys.includes(key))
        this.selectedModelKeys = kept.length ? kept : [...keys]
      } else {
        this.selectedModelKeys = [...keys]
      }
      this.connectivityTested = true
    },
    buildCreateModelsPayload () {
      return this.selectedModelKeys.map(key => {
        const meta = this.modelMeta[key] || {}
        const item = { model_key: key }
        if (meta.context_window > 0) item.context_window = meta.context_window
        if (meta.vision) item.input_modalities = ['text', 'image']
        return item
      })
    },
    handleCancel () {
      this.$router.push('/ai-provider')
    },
    buildBuiltinProviderConfig () {
      const config = {}
      if (this.showMoonshotRegion) {
        config.base_url = getMoonshotBaseURL(this.form.moonshot_region)
      } else if (this.showBaseUrl) {
        const url = String(this.form.base_url || '').trim() || getDefaultPublicBaseURL(this.form.provider_key)
        if (url) config.base_url = url
      }
      if (this.showApiMode && this.form.api_mode) config.api_mode = this.form.api_mode
      return config
    },
    buildConnectivityPayload () {
      const config = {}
      if (this.isCustom) {
        config.base_url = this.form.base_url
        config.api_mode = this.form.api_mode
      } else {
        Object.assign(config, this.buildBuiltinProviderConfig())
      }
      return {
        provider_key: this.effectiveProviderKey,
        secret: this.form.api_key,
        config: Object.keys(config).length ? config : undefined,
      }
    },
    validateConnectivityFields () {
      const fields = []
      if (!this.isBuiltin || this.showBuiltinProviderConfig) {
        fields.push('api_key')
      }
      if (this.isCustom) {
        fields.push('base_url')
      }
      if (!fields.length) {
        return Promise.reject(new Error(this.$t('common.tips.input', [this.$t('aice.aiproxy.provider_key')])))
      }
      return new Promise((resolve, reject) => {
        let pending = fields.length
        let failed = false
        fields.forEach(field => {
          this.$refs.form.validateField(field, (msg) => {
            if (msg) failed = true
            pending -= 1
            if (pending === 0) {
              if (failed) reject(new Error(msg || 'validation failed'))
              else resolve()
            }
          })
        })
      })
    },
    async probeConnectivity ({ preserveSelection = false } = {}) {
      await this.validateConnectivityFields()
      const { data } = await new this.$Manager('ai_providers').performClassAction({
        action: 'test-connectivity',
        data: this.buildConnectivityPayload(),
        timeout: 65000,
      })
      this.applyConnectivityTestResult(data, preserveSelection)
      return data
    },
    async testPost () {
      await this.probeConnectivity()
      const count = this.availableModels.length
      const description = this.modelsSource === 'catalog'
        ? this.$t('aice.aiproxy.connectivity_models_catalog_found', [count])
        : this.$t('aice.aiproxy.connectivity_models_found', [count])
      this.$notification.success({
        message: this.$t('common_270'),
        description,
      })
    },
    async handleSubmit () {
      if (this.createDisabled) {
        this.$message.warning(this.$t('aice.aiproxy.connectivity_models_required'))
        return
      }
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        await this.probeConnectivity({ preserveSelection: true })
        const config = {}
        if (this.isCustom) {
          config.base_url = this.form.base_url
          config.api_mode = this.form.api_mode
        } else {
          Object.assign(config, this.buildBuiltinProviderConfig())
        }
        await new this.$Manager('ai_providers').create({
          data: {
            generate_name: this.form.generate_name,
            provider_key: this.effectiveProviderKey,
            secret: this.form.api_key,
            models: this.buildCreateModelsPayload(),
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

<style scoped>
.provider-model-list {
  width: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.provider-model-list-empty {
  color: rgba(0, 0, 0, 0.45);
  text-align: center;
  padding: 24px 8px;
  line-height: 1.5;
}
</style>

<template>
  <base-dialog :width="720" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item v-if="params.type !== 'edit'" :label="$t('aice.aiproxy.provider_type')">
          <a-radio-group v-model="form.provider_type" :options="providerTypeOptions" />
        </a-form-model-item>
        <a-form-model-item v-if="params.type !== 'edit'" :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item v-else :label="$t('common.name')">
          <span>{{ form.name }}</span>
        </a-form-model-item>
        <template v-if="isBuiltin">
          <a-form-model-item :label="$t('aice.aiproxy.provider_key')" prop="provider_key">
            <aiproxy-provider-key-auto-complete
              v-if="params.type !== 'edit'"
              v-model="form.provider_key"
              :placeholder="$t('common.tips.input', [$t('aice.aiproxy.provider_key')])" />
            <aiproxy-provider-label
              v-else
              :provider-key="form.provider_key"
              :label="form.provider_key"
              :icon-size="18" />
          </a-form-model-item>
          <template v-if="showBuiltinProviderConfig">
            <a-form-model-item v-if="showApiMode" :label="$t('aice.aiproxy.api_mode')">
              <a-select v-model="form.api_mode" :options="apiModeOptions" />
            </a-form-model-item>
            <a-form-model-item v-if="showBaseUrl" :label="$t('aice.aiproxy.api_url')" prop="base_url">
              <a-input v-model="form.base_url" />
            </a-form-model-item>
            <a-form-model-item v-if="params.type !== 'edit'" :label="$t('aice.aiproxy.api_key_field')" prop="api_key">
              <a-input-password v-model="form.api_key" />
            </a-form-model-item>
          </template>
        </template>
        <template v-else>
          <a-form-model-item v-if="params.type === 'edit'" :label="$t('aice.aiproxy.provider_key')">
            <aiproxy-provider-label
              :provider-key="customProviderKey"
              :label="$t('aice.aiproxy.provider_type.custom')"
              :icon-size="18" />
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.aiproxy.api_mode')">
            <a-select v-model="form.api_mode" :options="apiModeOptions" />
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.aiproxy.api_url')" prop="base_url" :required="isCustom">
            <a-input v-model="form.base_url" :placeholder="baseUrlPlaceholder" />
          </a-form-model-item>
          <a-form-model-item v-if="params.type !== 'edit'" :label="$t('aice.aiproxy.api_key_field')" prop="api_key">
            <a-input-password v-model="form.api_key" />
          </a-form-model-item>
        </template>
        <a-form-model-item v-if="params.type !== 'edit' && connectivityTested" :label="$t('aice.aiproxy.model_key')" required>
          <a-input
            v-model="modelSearch"
            allow-clear
            :placeholder="$t('common.search')"
            class="mb-2" />
          <div class="provider-model-list">
            <a-checkbox-group v-model="selectedModelKeys" class="d-flex flex-column">
              <a-checkbox
                v-for="opt in filteredModelOptions"
                :key="opt.value"
                :value="opt.value"
                class="mb-1">
                {{ opt.label }}
              </a-checkbox>
            </a-checkbox-group>
          </div>
        </a-form-model-item>
        <a-alert
          v-if="params.type !== 'edit' && connectivityTested && modelsSource === 'catalog'"
          type="info"
          show-icon
          :message="$t('aice.aiproxy.connectivity_models_catalog_hint')"
          class="mb-2" />
        <a-alert
          v-if="params.type !== 'edit' && !connectivityTested"
          type="info"
          show-icon
          :message="$t('aice.aiproxy.connectivity_models_hint')" />
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" :disabled="createDisabled" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      <test-button
        v-if="params.type !== 'edit'"
        :post="testPost"
        :disabled="testConnectivityDisabled"
        :is-success-alert="false" />
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'
import TestButton from '@/sections/TestButton'
import AiproxyProviderKeyAutoComplete from '@Ai/components/AiproxyProviderKeyAutoComplete'
import AiproxyProviderLabel from '@Ai/components/AiproxyProviderLabel'
import { getApiModeOptions, supportsDualAPIMode } from '@Ai/utils/aiproxyProviderApiMode'
import { hasDefaultPublicBaseURL } from '@Ai/utils/aiproxyProviderDefaults'
import {
  CUSTOM_PROVIDER_KEY,
  PROVIDER_TYPE_BUILTIN,
  PROVIDER_TYPE_CUSTOM,
  getProviderTypeOptions,
  isCustomProviderKey,
} from '@Ai/utils/aiproxyProviderTypes'

export default {
  name: 'AiProviderFormDialog',
  components: { AiproxyProviderKeyAutoComplete, AiproxyProviderLabel, TestButton },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? (this.params.data[0] || {}) : {}
    const providerKey = data.provider_key || ''
    return {
      loading: false,
      connectivityTested: false,
      modelsSource: '',
      availableModelKeys: [],
      selectedModelKeys: [],
      modelSearch: '',
      customProviderKey: CUSTOM_PROVIDER_KEY,
      form: {
        provider_type: isCustomProviderKey(providerKey) ? PROVIDER_TYPE_CUSTOM : PROVIDER_TYPE_BUILTIN,
        name: data.name,
        generate_name: '',
        provider_key: providerKey,
        api_mode: data.config?.api_mode || 'openai',
        base_url: data.config?.base_url || '',
        api_key: '',
      },
      rules: {
        generate_name: this.params.type === 'edit' ? [] : [{ required: true, validator: this.$validate('resourceName') }],
        provider_key: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.provider_key')]) }],
        api_key: this.params.type === 'edit' ? [] : [{
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
      return this.showBuiltinProviderConfig && !hasDefaultPublicBaseURL(this.form.provider_key)
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
      if (this.params.type === 'edit') return true
      if (!String(this.form.api_key || '').trim()) return true
      if (this.isCustom && !String(this.form.base_url || '').trim()) return true
      if (this.isBuiltin && !this.showBuiltinProviderConfig) return true
      return false
    },
    filteredModelOptions () {
      const q = String(this.modelSearch || '').trim().toLowerCase()
      return this.availableModelKeys
        .filter(key => !q || String(key).toLowerCase().includes(q))
        .map(key => ({ value: key, label: key }))
    },
    createDisabled () {
      if (this.params.type === 'edit') return false
      return !this.connectivityTested || this.selectedModelKeys.length < 1
    },
  },
  watch: {
    'form.provider_key' () {
      if (this.params.type === 'edit') return
      this.resetConnectivityState()
    },
    'form.api_key' () {
      if (this.params.type === 'edit') return
      this.resetConnectivityState()
    },
    'form.base_url' () {
      if (this.params.type === 'edit') return
      this.resetConnectivityState()
    },
    'form.api_mode' () {
      if (this.params.type === 'edit') return
      this.resetConnectivityState()
    },
    'form.provider_type' (type) {
      if (this.params.type === 'edit') return
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
      this.availableModelKeys = []
      this.selectedModelKeys = []
      this.modelSearch = ''
    },
    applyConnectivityTestResult (data, preserveSelection = false) {
      const models = Array.isArray(data?.models) ? data.models : []
      const keys = models.map(item => item?.model_key).filter(Boolean)
      this.modelsSource = data?.models_source || ''
      this.availableModelKeys = keys
      if (preserveSelection && this.selectedModelKeys.length) {
        const kept = this.selectedModelKeys.filter(key => keys.includes(key))
        this.selectedModelKeys = kept.length ? kept : [...keys]
      } else {
        this.selectedModelKeys = [...keys]
      }
      this.connectivityTested = true
    },
    buildConnectivityPayload () {
      const config = {}
      if (this.isCustom) {
        config.base_url = this.form.base_url
        config.api_mode = this.form.api_mode
      } else {
        if (this.showBaseUrl && this.form.base_url) config.base_url = this.form.base_url
        if (this.showApiMode && this.form.api_mode) config.api_mode = this.form.api_mode
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
      const data = await this.probeConnectivity()
      const count = Array.isArray(data?.models) ? data.models.length : 0
      const description = data?.models_source === 'catalog'
        ? this.$t('aice.aiproxy.connectivity_models_catalog_found', [count])
        : this.$t('aice.aiproxy.connectivity_models_found', [count])
      this.$notification.success({
        message: this.$t('common_270'),
        description,
      })
    },
    buildPayload () {
      const config = {}
      if (this.isCustom) {
        config.base_url = this.form.base_url
        config.api_mode = this.form.api_mode
      } else {
        if (this.showBaseUrl && this.form.base_url) config.base_url = this.form.base_url
        if (this.showApiMode && this.form.api_mode) config.api_mode = this.form.api_mode
      }
      const payload = {
        provider_key: this.effectiveProviderKey,
      }
      if (Object.keys(config).length) payload.config = config
      if (this.params.type !== 'edit') {
        payload.generate_name = this.form.generate_name
        payload.secret = this.form.api_key
        payload.model_keys = this.selectedModelKeys
      }
      return payload
    },
    async handleConfirm () {
      if (this.params.type !== 'edit' && this.createDisabled) {
        this.$message.warning(this.$t('aice.aiproxy.connectivity_models_required'))
        return
      }
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        if (this.params.type !== 'edit') {
          await this.probeConnectivity({ preserveSelection: true })
        }
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

<style scoped>
.provider-model-list {
  width: 100%;
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 8px 12px;
}

.provider-model-list ::v-deep .ant-checkbox-wrapper {
  display: block;
  margin-left: 0;
}

.provider-model-list ::v-deep .ant-checkbox-wrapper + .ant-checkbox-wrapper {
  margin-left: 0;
}
</style>

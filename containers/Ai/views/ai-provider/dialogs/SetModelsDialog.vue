<template>
  <base-dialog :width="880" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.aiproxy.set_models') }}</div>
    <div slot="body">
      <a-form-model :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
        <a-form-model-item :label="$t('common.name')">
          <span>{{ provider.name }}</span>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.provider_key')">
          <aiproxy-provider-label
            :provider-key="provider.provider_key"
            :label="provider.provider_key"
            :icon-size="18" />
        </a-form-model-item>
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
          type="info"
          show-icon
          :message="connectivityTested ? $t('aice.aiproxy.set_models_hint') : $t('aice.aiproxy.connectivity_models_hint')"
          class="mb-0" />
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" :disabled="confirmDisabled" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      <test-button class="ml-2" :post="testPost" :is-success-alert="false" />
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import TestButton from '@/sections/TestButton'
import AiproxyProviderLabel from '@Ai/components/AiproxyProviderLabel'
import { fetchProviderModelKeyOptions } from '@Ai/utils/aiModelNames'

function defaultMeta (model = {}) {
  return {
    context_window: model.context_window > 0 ? model.context_window : undefined,
    vision: false,
  }
}

export default {
  name: 'AiProviderSetModelsDialog',
  components: { AiproxyProviderLabel, TestButton },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      connectivityTested: false,
      modelsSource: '',
      availableModels: [],
      selectedModelKeys: [],
      modelMeta: {},
      importedModelKeys: [],
      modelSearch: '',
    }
  },
  computed: {
    provider () {
      return this.params.data[0] || {}
    },
    importedModelKeySet () {
      return new Set(this.importedModelKeys.map(key => String(key).toLowerCase()))
    },
    filteredModelRows () {
      const q = String(this.modelSearch || '').trim().toLowerCase()
      return this.availableModels
        .filter(item => !q || String(item.model_key).toLowerCase().includes(q))
        .map(item => ({
          model_key: item.model_key,
          ...(this.modelMeta[item.model_key] || defaultMeta(item)),
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
          customRender: (text, row) => {
            return (
              <a-input-number
                value={this.modelMeta[row.model_key]?.context_window}
                min={0}
                step={1024}
                style="width: 100%"
                onChange={val => this.updateModelMeta(row.model_key, 'context_window', val)}
              />
            )
          },
        },
        {
          title: this.$t('aice.aiproxy.capability_vision'),
          key: 'vision',
          width: 100,
          align: 'center',
          customRender: (text, row) => {
            return (
              <a-checkbox
                checked={!!this.modelMeta[row.model_key]?.vision}
                onChange={e => this.updateModelMeta(row.model_key, 'vision', e.target.checked)}
              />
            )
          },
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
      if (this.importedModelKeys.length) {
        return this.$t('aice.aiproxy.set_models_all_imported')
      }
      return this.$t('aice.aiproxy.set_models_none')
    },
    confirmDisabled () {
      return !this.connectivityTested || this.selectedModelKeys.length < 1
    },
  },
  created () {
    this.loadImportedModelKeys()
  },
  methods: {
    providerManager () {
      return new this.$Manager('ai_providers')
    },
    updateModelMeta (modelKey, field, value) {
      const prev = this.modelMeta[modelKey] || defaultMeta()
      this.$set(this.modelMeta, modelKey, {
        ...prev,
        [field]: value,
      })
    },
    async loadImportedModelKeys () {
      const options = await fetchProviderModelKeyOptions(this.provider.id, { vm: this })
      this.importedModelKeys = (options || []).map(item => String(item.value || '').trim()).filter(Boolean)
    },
    excludeImportedModels (models) {
      return (models || []).filter(item => {
        const key = String(item?.model_key || '').trim()
        return key && !this.importedModelKeySet.has(key.toLowerCase())
      })
    },
    applyConnectivityTestResult (data, preserveSelection = false) {
      const models = this.excludeImportedModels(Array.isArray(data?.models) ? data.models : [])
      this.modelsSource = data?.models_source || ''
      this.availableModels = models.map(item => ({
        model_key: String(item.model_key).trim(),
        context_window: item.context_window > 0 ? item.context_window : undefined,
      }))
      const nextMeta = { ...this.modelMeta }
      this.availableModels.forEach(item => {
        if (!nextMeta[item.model_key]) {
          nextMeta[item.model_key] = defaultMeta(item)
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
    buildSetModelsPayload () {
      return {
        models: this.selectedModelKeys.map(key => {
          const meta = this.modelMeta[key] || defaultMeta()
          const item = { model_key: key }
          if (meta.context_window > 0) item.context_window = meta.context_window
          if (meta.vision) item.input_modalities = ['text', 'image']
          return item
        }),
      }
    },
    async probeConnectivity ({ preserveSelection = false } = {}) {
      await this.loadImportedModelKeys()
      const { data } = await this.providerManager().performAction({
        id: this.provider.id,
        action: 'test-connectivity',
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
    async handleConfirm () {
      if (this.confirmDisabled) {
        this.$message.warning(this.$t('aice.aiproxy.connectivity_models_required'))
        return
      }
      this.loading = true
      try {
        await this.probeConnectivity({ preserveSelection: true })
        await this.providerManager().performAction({
          id: this.provider.id,
          action: 'set-models',
          data: this.buildSetModelsPayload(),
        })
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

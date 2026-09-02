<template>
  <base-dialog :width="720" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.aiproxy.set_models') }}</div>
    <div slot="body">
      <a-form-model :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
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
          <div v-if="!filteredModelOptions.length" class="text-secondary mt-1">
            {{ $t('common.noData') }}
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

export default {
  name: 'AiProviderSetModelsDialog',
  components: { AiproxyProviderLabel, TestButton },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      connectivityTested: false,
      modelsSource: '',
      availableModelKeys: [],
      selectedModelKeys: [],
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
    filteredModelOptions () {
      const q = String(this.modelSearch || '').trim().toLowerCase()
      return this.availableModelKeys
        .filter(key => !q || String(key).toLowerCase().includes(q))
        .map(key => ({ value: key, label: key }))
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
    async loadImportedModelKeys () {
      const options = await fetchProviderModelKeyOptions(this.provider.id, { vm: this })
      this.importedModelKeys = (options || []).map(item => String(item.value || '').trim()).filter(Boolean)
    },
    excludeImportedKeys (keys) {
      return (keys || []).filter(key => !this.importedModelKeySet.has(String(key).toLowerCase()))
    },
    applyConnectivityTestResult (data, preserveSelection = false) {
      const models = Array.isArray(data?.models) ? data.models : []
      const keys = this.excludeImportedKeys(models.map(item => item?.model_key).filter(Boolean))
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
      const count = this.availableModelKeys.length
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
          data: { model_keys: this.selectedModelKeys },
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

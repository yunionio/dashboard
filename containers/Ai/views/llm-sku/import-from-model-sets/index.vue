<!--
  推理模板：从 GPUStack 模型目录导入 SKU。
  路由：/llm-sku/import-from-model-sets
-->
<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body needMarginBottom>
      <catalog-set-grid @select="onSetSelect" />
    </page-body>

    <a-drawer
      wrap-class-name="catalog-drawer-wrap"
      :visible="drawerVisible"
      :width="720"
      destroy-on-close
      placement="right"
      @close="clearSet">
      <div v-if="set" class="catalog-drawer-layout">
        <div class="catalog-drawer-header">
          <div class="catalog-drawer-name">{{ set.name }}</div>
        </div>

        <div class="catalog-drawer-scroll">
          <catalog-drawer-meta-panel :set="set" />
          <a-divider orientation="left">{{ $t('aice.llm_catalog.specs') }}</a-divider>
          <a-radio-group v-model="selectedSpecId" class="spec-list mb-3">
            <a-radio
              v-for="spec in catalogSpecs"
              :key="getCatalogSpecId(spec)"
              :value="getCatalogSpecId(spec)"
              class="spec-row">
              <div class="spec-row-content">
                <div class="spec-row-title">
                  {{ spec.name || spec.label || getCatalogSpecId(spec) }}
                </div>
                <div class="spec-row-meta">
                  <a-tag v-if="spec.backend">{{ spec.backend }}</a-tag>
                  <a-tag v-if="spec.quantization">{{ spec.quantization }}</a-tag>
                  <a-tag v-if="spec.source" color="cyan">{{ spec.source }}</a-tag>
                </div>
              </div>
            </a-radio>
          </a-radio-group>

          <a-divider
            v-if="selectedSpec && catalogLlmType"
            orientation="left">
            {{ $t('aice.llm_catalog.import_config') }}
          </a-divider>
          <catalog-import-sku-form
            v-if="selectedSpec && catalogLlmType"
            ref="importFormRef"
            :catalog-set="set"
            :catalog-spec="selectedSpec"
            @success="onImportSuccess"
            @cancel="clearSet" />

          <a-alert
            v-else-if="selectedSpecId && !catalogLlmType"
            type="warning"
            :message="$t('aice.llm_catalog.unsupported_backend')"
            show-icon
            class="mb-3" />
        </div>

        <div v-if="selectedSpec && catalogLlmType" class="catalog-drawer-footer">
          <a-button class="mr-2" @click="clearSet">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" :loading="submitLoading" @click="handleImport">
            {{ $t('aice.llm_catalog.import_template') }}
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import CatalogSetGrid from '@Ai/sections/catalog-model-sets/components/CatalogSetGrid.vue'
import CatalogDrawerMetaPanel from '@Ai/sections/catalog-model-sets/components/CatalogDrawerMetaPanel.vue'
import CatalogImportSkuForm from '@Ai/views/llm-sku/shared/CatalogImportSkuForm.vue'
import {
  backendToLlmType,
  getCatalogSpecId,
  isCatalogInferenceBackend,
} from '@Ai/utils/catalogSpec'

export default {
  name: 'LlmSkuImportFromModelSets',
  components: {
    CatalogSetGrid,
    CatalogDrawerMetaPanel,
    CatalogImportSkuForm,
  },
  data () {
    return {
      set: null,
      selectedSpecId: '',
      submitLoading: false,
    }
  },
  computed: {
    headerTitle () {
      return this.$t('aice.import_model') + ' - ' + this.$t('aice.llm_sku')
    },
    drawerVisible () {
      return !!this.set
    },
    catalogSpecs () {
      return (this.set && this.set.specs) || []
    },
    selectedSpec () {
      if (!this.selectedSpecId) return null
      return this.catalogSpecs.find(s => getCatalogSpecId(s) === this.selectedSpecId) || null
    },
    catalogLlmType () {
      if (!this.selectedSpec) return ''
      if (!isCatalogInferenceBackend(this.selectedSpec.backend)) return ''
      return backendToLlmType(this.selectedSpec.backend)
    },
  },
  methods: {
    getCatalogSpecId,
    onSetSelect (set) {
      this.set = set
      const specs = set.specs || []
      const first = specs.find(s => isCatalogInferenceBackend(s.backend)) || specs[0]
      this.selectedSpecId = first ? getCatalogSpecId(first) : ''
    },
    clearSet () {
      this.set = null
      this.selectedSpecId = ''
    },
    async handleImport () {
      const form = this.$refs.importFormRef
      if (!form) return
      this.submitLoading = true
      try {
        await form.handleCatalogImport()
      } finally {
        this.submitLoading = false
      }
    },
    onImportSuccess () {
      this.clearSet()
      this.$router.push('/llm-sku')
    },
  },
}
</script>

<style lang="less" scoped>
.spec-list { display: block; }
.spec-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  width: 100%;
}
.spec-row-content { margin-left: 8px; }
.spec-row-title { font-weight: 500; }
.spec-row-meta { margin-top: 4px; }
</style>

<style lang="less" src="@Ai/sections/catalog-model-sets/catalog-drawer.less"></style>

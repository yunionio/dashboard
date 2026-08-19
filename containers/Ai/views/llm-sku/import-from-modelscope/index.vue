<!--
  推理模板：从 ModelScope 导入 SKU。
  路由：/llm-sku/import-from-modelscope
-->
<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body needMarginBottom>
      <ms-browse-pane
        ref="browse"
        :action-button-label="$t('aice.import_model')"
        @open-drawer="onOpenDrawer" />
    </page-body>

    <a-drawer
      wrap-class-name="catalog-drawer-wrap"
      :visible="drawerVisible"
      :width="'50%'"
      destroy-on-close
      placement="right"
      @close="closeDrawer">
      <div v-if="formRepo" class="catalog-drawer-layout">
        <div class="catalog-drawer-header">
          <div class="catalog-drawer-name">{{ formModelId }}</div>
        </div>

        <div class="catalog-drawer-scroll">
          <catalog-drawer-meta-panel :set="msCatalogSet" />
          <a-divider
            v-if="msCatalogSpec"
            orientation="left">
            {{ $t('aice.llm_catalog.import_config') }}
          </a-divider>
          <catalog-import-sku-form
            v-if="msCatalogSpec"
            ref="importFormRef"
            :key="formModelId"
            :catalog-set="msCatalogSet"
            :catalog-spec="msCatalogSpec"
            catalog-type-selectable
            @success="onImportSuccess"
            @cancel="closeDrawer" />
        </div>

        <div v-if="msCatalogSpec" class="catalog-drawer-footer">
          <a-button class="mr-2" @click="closeDrawer">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" :loading="submitLoading" @click="handleImport">
            {{ $t('aice.import_model') }}
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import MsBrowsePane from '@Ai/sections/import-from-modelscope/components/MsBrowsePane.vue'
import CatalogDrawerMetaPanel from '@Ai/sections/catalog-model-sets/components/CatalogDrawerMetaPanel.vue'
import CatalogImportSkuForm from '@Ai/views/llm-sku/shared/CatalogImportSkuForm.vue'
import { parseLlmRoute } from '@Ai/utils/llmRouteContext'
import { buildMsCatalogSet, buildMsCatalogSpec, modelIdOf } from '@Ai/utils/msImportSpec'

export default {
  name: 'LlmSkuImportFromModelScope',
  components: {
    MsBrowsePane,
    CatalogDrawerMetaPanel,
    CatalogImportSkuForm,
  },
  data () {
    return {
      formRepo: null,
      submitLoading: false,
    }
  },
  computed: {
    llmRouteCtx () {
      return parseLlmRoute(this.$route.path)
    },
    headerTitle () {
      return this.$t('aice.import_model') + ' - ' + this.$t('aice.llm_sku')
    },
    formModelId () {
      return modelIdOf(this.formRepo)
    },
    drawerVisible () {
      return !!this.formRepo
    },
    msCatalogSet () {
      if (!this.formRepo) return null
      return buildMsCatalogSet(this.formRepo, this.formModelId)
    },
    msCatalogSpec () {
      if (!this.formModelId) return null
      return buildMsCatalogSpec(this.formModelId, 'vLLM', this.formRepo)
    },
  },
  methods: {
    onOpenDrawer (item) {
      this.formRepo = item
      if (this.$refs.browse) {
        this.$refs.browse.ensurePreview(item)
      }
    },
    closeDrawer () {
      this.formRepo = null
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
      this.closeDrawer()
      this.$router.push(this.llmRouteCtx.skuListPath)
    },
  },
}
</script>

<style lang="less" src="@Ai/sections/catalog-model-sets/catalog-drawer.less"></style>

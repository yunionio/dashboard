<!--
  推理模板：从 Hugging Face 导入 SKU。
  路由：/llm-sku/import-from-huggingface
-->
<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body needMarginBottom>
      <hf-browse-pane
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
          <div class="catalog-drawer-name">{{ formRepoId }}</div>
        </div>

        <div class="catalog-drawer-scroll">
          <catalog-drawer-meta-panel :set="hfCatalogSet" />
          <a-divider
            v-if="hfCatalogSpec"
            orientation="left">
            {{ $t('aice.llm_catalog.import_config') }}
          </a-divider>
          <catalog-import-sku-form
            v-if="hfCatalogSpec"
            ref="importFormRef"
            :key="formRepoId"
            :catalog-set="hfCatalogSet"
            :catalog-spec="hfCatalogSpec"
            catalog-type-selectable
            @success="onImportSuccess"
            @cancel="closeDrawer" />
        </div>

        <div v-if="hfCatalogSpec" class="catalog-drawer-footer">
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
import HfBrowsePane from '@Ai/sections/import-from-huggingface/components/HfBrowsePane.vue'
import CatalogDrawerMetaPanel from '@Ai/sections/catalog-model-sets/components/CatalogDrawerMetaPanel.vue'
import { repoIdOf } from '@Ai/utils/hfRepo'
import CatalogImportSkuForm from '@Ai/views/llm-sku/shared/CatalogImportSkuForm.vue'
import { parseLlmRoute } from '@Ai/utils/llmRouteContext'
import { buildHfCatalogSet, buildHfCatalogSpec } from '@Ai/utils/hfImportSpec'

export default {
  name: 'LlmSkuImportFromHuggingFace',
  components: {
    HfBrowsePane,
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
    formRepoId () {
      return repoIdOf(this.formRepo)
    },
    drawerVisible () {
      return !!this.formRepo
    },
    hfCatalogSet () {
      if (!this.formRepo) return null
      return buildHfCatalogSet(this.formRepo, this.formRepoId)
    },
    hfCatalogSpec () {
      if (!this.formRepoId) return null
      return buildHfCatalogSpec(this.formRepoId, 'vLLM', this.formRepo)
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

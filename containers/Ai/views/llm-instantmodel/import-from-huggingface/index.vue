<!--
  秒装模型：从 Hugging Face 导入。
  路由：/llm-instantmodel/import-from-huggingface
-->
<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body needMarginBottom>
      <hf-browse-pane
        ref="browse"
        :action-button-label="$t('aice.import')"
        @open-drawer="onOpenDrawer" />
    </page-body>

    <a-drawer
      wrap-class-name="catalog-drawer-wrap"
      :visible="drawerVisible"
      :width="720"
      destroy-on-close
      placement="right"
      @close="closeDrawer">
      <div v-if="formRepo" class="catalog-drawer-layout">
        <div class="catalog-drawer-header">
          <div class="catalog-drawer-name">{{ formRepoId }}</div>
        </div>

        <div class="catalog-drawer-scroll">
          <catalog-drawer-meta-panel :set="hfCatalogSet" />
          <a-divider orientation="left">{{ $t('aice.llm_catalog.import_config') }}</a-divider>
          <hf-instant-import-form
            :key="formRepoId"
            ref="importFormRef"
            :repo-id="formRepoId"
            revision="main" />
        </div>

        <div class="catalog-drawer-footer">
          <a-button class="mr-2" @click="closeDrawer">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" :loading="submitLoading" @click="handleImport">
            {{ $t('aice.import') }}
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
import { buildHfCatalogSet } from '@Ai/utils/hfImportSpec'
import HfInstantImportForm from '@Ai/views/llm-instantmodel/shared/HfInstantImportForm.vue'

export default {
  name: 'LlmInstantmodelImportFromHuggingFace',
  components: {
    HfBrowsePane,
    CatalogDrawerMetaPanel,
    HfInstantImportForm,
  },
  data () {
    return {
      formRepo: null,
      submitLoading: false,
      instantModelsManager: new this.$Manager('llm_instant_models'),
    }
  },
  computed: {
    headerTitle () {
      return this.$t('aice.llm_deployment.deploy.from_huggingface') + ' - ' + this.$t('aice.llm_instantmodel.menu')
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
        const data = await form.validateAndGetData()
        await this.instantModelsManager.create({ data })
        this.$message.success(this.$t('common.success'))
        this.closeDrawer()
        this.$router.push({ name: 'LlmInstantmodelList' })
      } finally {
        this.submitLoading = false
      }
    },
  },
}
</script>

<style lang="less" src="@Ai/sections/catalog-model-sets/catalog-drawer.less"></style>

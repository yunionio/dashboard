<!--
  秒装模型：从社区模型库导入。
  路由：/llm-instantmodel/import-from-community
-->
<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body needMarginBottom>
      <div class="catalog-model-page">
        <community-model-grid @select="onTagSelect" />
      </div>
    </page-body>

    <a-drawer
      wrap-class-name="catalog-drawer-wrap"
      :visible="drawerVisible"
      :width="720"
      destroy-on-close
      placement="right"
      @close="clearTag">
      <div v-if="tag" class="catalog-drawer-layout">
        <div class="catalog-drawer-header">
          <div class="catalog-drawer-name">{{ tag.full_name }}</div>
        </div>

        <div class="catalog-drawer-scroll">
          <catalog-drawer-meta-panel :tag="tag" />
          <a-divider orientation="left">{{ $t('aice.llm_catalog.import_config') }}</a-divider>
          <community-import-form
            :key="importFormKey"
            ref="importFormRef"
            :tag="tag" />
        </div>

        <div class="catalog-drawer-footer">
          <a-button class="mr-2" @click="clearTag">{{ $t('common.cancel') }}</a-button>
          <a-button type="primary" :loading="submitLoading" @click="handleImport">
            {{ $t('aice.import') }}
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import CommunityModelGrid from '@Ai/sections/community-registry/components/CommunityModelGrid.vue'
import CatalogDrawerMetaPanel from '@Ai/sections/catalog-model-sets/components/CatalogDrawerMetaPanel.vue'
import CommunityImportForm from './components/CommunityImportForm.vue'
import { getCommunityTagId } from '@Ai/utils/communityRegistry'

export default {
  name: 'LlmInstantmodelImportFromCommunity',
  components: {
    CommunityModelGrid,
    CatalogDrawerMetaPanel,
    CommunityImportForm,
  },
  data () {
    return {
      tag: null,
      submitLoading: false,
      instantModelsManager: new this.$Manager('llm_instant_models'),
    }
  },
  computed: {
    headerTitle () {
      return this.$t('aice.llm_image.import_community') + ' - ' + this.$t('aice.llm_instantmodel.menu')
    },
    drawerVisible () {
      return !!this.tag
    },
    importFormKey () {
      return getCommunityTagId(this.tag)
    },
  },
  methods: {
    onTagSelect (item) {
      this.tag = item
    },
    clearTag () {
      this.tag = null
    },
    async handleImport () {
      const form = this.$refs.importFormRef
      if (!form) return
      this.submitLoading = true
      try {
        const data = await form.validateAndGetData()
        await this.instantModelsManager.create({ data })
        this.$message.success(this.$t('common.success'))
        this.clearTag()
        this.$router.push({ name: 'LlmInstantmodelList' })
      } finally {
        this.submitLoading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
</style>

<style lang="less" src="@Ai/sections/catalog-model-sets/catalog-model-page.less"></style>
<style lang="less" src="@Ai/sections/catalog-model-sets/catalog-drawer.less"></style>

<!--
  Agent / 桌面模板：从社区目录导入镜像 + 默认 SKU。
-->
<template>
  <div>
    <page-header :title="headerTitle" />
    <page-body class="catalog-grid-page-body">
      <div class="catalog-model-page">
        <community-image-grid
          :allowed-types="allowedTypes"
          :catalog-items="catalogItems"
          :existing-images="existingImages"
          :loading="catalogLoading"
          @select="onItemSelect"
          @refresh="loadExistingImages" />
      </div>
    </page-body>

    <a-drawer
      wrap-class-name="catalog-drawer-wrap"
      :visible="drawerVisible"
      :width="720"
      destroy-on-close
      placement="right"
      @close="clearItem">
      <div v-if="selectedItem" class="catalog-drawer-layout">
        <div class="catalog-drawer-header">
          <div class="catalog-drawer-name">{{ displayTitle(selectedItem) }}</div>
        </div>

        <div class="catalog-drawer-scroll">
          <a-descriptions :column="1" size="small" bordered class="mb-3">
            <a-descriptions-item v-if="selectedItem.app_name" :label="$t('aice.llm_image.app_name')">
              {{ selectedItem.app_name }}
            </a-descriptions-item>
            <a-descriptions-item v-if="isBundleItem(selectedItem) && itemSubtitle(selectedItem)" :label="$t('aice.llm_image.name')">
              {{ itemSubtitle(selectedItem) }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('aice.llm_image.name')">
              {{ imageLine(selectedItem) }}
            </a-descriptions-item>
            <a-descriptions-item v-if="isDesktopCommunityItem(selectedItem)" :label="$t('aice.llm_type.app')">
              {{ llmTypeLabel(selectedItem.llm_type) }}
            </a-descriptions-item>
            <a-descriptions-item v-if="isItemImported" :label="$t('common.status')">
              <a-tag color="green">{{ $t('aice.llm_image.imported') }}</a-tag>
            </a-descriptions-item>
          </a-descriptions>
          <a-divider orientation="left">{{ $t('common.description') }}</a-divider>
          <div class="md-desc" v-html="descriptionHtml" />

          <template v-if="needsGpuSelection">
            <a-divider orientation="left">{{ $t('aice.llm_catalog.import_config') }}</a-divider>
            <a-form-model
              ref="importFormRef"
              :model="importForm"
              :rules="importRules"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 18 }">
              <a-form-model-item :label="$t('aice.devices')" prop="devices">
                <llm-gpu-devices-editor v-model="importForm.devices" />
              </a-form-model-item>
            </a-form-model>
          </template>
        </div>

        <div class="catalog-drawer-footer">
          <a-button class="mr-2" @click="clearItem">{{ $t('common.cancel') }}</a-button>
          <a-button
            type="primary"
            :loading="submitLoading"
            :disabled="isItemImported"
            @click="handleImport">
            {{ $t('aice.import') }}
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import marked from 'marked'
import { createEmptyDeviceRow, isValidDeviceRows } from '@Ai/utils/deviceFormUtils'
import CommunityImageGrid from '@Ai/sections/community-images/components/CommunityImageGrid.vue'
import LlmGpuDevicesEditor from '@Ai/sections/LlmGpuDevicesEditor.vue'
import { parseLlmRoute, getLlmSkuTypeFilter } from '@Ai/utils/llmRouteContext'
import {
  communityImportNeedsGpuSelection,
  createCommunityImageAndSku,
  fetchCommunityImageItems,
  fetchExistingCommunityImageKeys,
  formatCommunityDisplayTitle,
  getCommunityImageKey,
  getCommunityItemImageLine,
  getCommunityItemSubtitle,
  isBundleItem,
  isCommunityImageImported,
  isDesktopCommunityItem,
} from '@Ai/utils/communityImages'

export default {
  name: 'LlmSkuImportFromCommunity',
  components: {
    CommunityImageGrid,
    LlmGpuDevicesEditor,
  },
  data () {
    return {
      selectedItem: null,
      catalogItems: [],
      catalogLoading: false,
      existingImages: {},
      submitLoading: false,
      importForm: {
        devices: [createEmptyDeviceRow()],
      },
      imagesManager: new this.$Manager('llm_images'),
      skusManager: new this.$Manager('llm_skus'),
      catalogManager: new this.$Manager('llm_images_catalogs', 'v1'),
    }
  },
  computed: {
    llmRouteCtx () {
      return parseLlmRoute(this.$route.path)
    },
    allowedTypes () {
      return this.llmRouteCtx.llmTypes || []
    },
    headerTitle () {
      const skuLabel = this.llmRouteCtx.isDesktopType
        ? this.$t('aice.desktop_llm_sku')
        : this.$t('aice.app_llm_sku')
      return this.$t('aice.import') + ' - ' + skuLabel
    },
    drawerVisible () {
      return !!this.selectedItem
    },
    isItemImported () {
      return isCommunityImageImported(this.selectedItem, this.existingImages)
    },
    descriptionHtml () {
      const text = this.selectedItem?.description
      if (!text || text === '-') return '-'
      return marked(text)
    },
    needsGpuSelection () {
      return communityImportNeedsGpuSelection(this.selectedItem)
    },
    importRules () {
      return {
        devices: [{
          required: true,
          type: 'array',
          validator: (rule, value, callback) => {
            if (!isValidDeviceRows(value)) {
              callback(new Error(this.$t('common.tips.select', [this.$t('aice.devices')])))
              return
            }
            callback()
          },
        }],
      }
    },
  },
  activated () {
    this.loadExistingImages()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.loadExistingImages()
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.loadExistingImages()
    next()
  },
  methods: {
    displayTitle (item) {
      return formatCommunityDisplayTitle(item, type => this.llmTypeLabel(type))
    },
    itemSubtitle (item) {
      return getCommunityItemSubtitle(item)
    },
    isDesktopCommunityItem,
    isBundleItem,
    imageLine (item) {
      if (!item) return ''
      if (isBundleItem(item)) {
        const count = item.images?.length || 0
        return count > 0 ? `${count} images` : '-'
      }
      return getCommunityItemImageLine(item) || '-'
    },
    llmTypeLabel (type) {
      if (!type) return '-'
      const key = `aice.llm_type.${String(type).replace(/-/g, '_')}`
      return this.$te(key) ? this.$t(key) : type
    },
    async loadExistingImages () {
      if (this._loadExistingPromise) {
        return this._loadExistingPromise
      }
      this._loadExistingPromise = this._fetchExistingImages()
        .finally(() => {
          this._loadExistingPromise = null
        })
      return this._loadExistingPromise
    },
    async _fetchExistingImages () {
      this.catalogLoading = true
      try {
        const items = await fetchCommunityImageItems(this.allowedTypes, this.catalogManager)
        this.catalogItems = items
        this.existingImages = await fetchExistingCommunityImageKeys(
          this.allowedTypes,
          this.skusManager,
          items,
          {
            scope: this.$store.getters.scope,
            typeFilter: getLlmSkuTypeFilter(this.llmRouteCtx),
          },
        )
      } catch (err) {
        if (err && !err.__CANCEL__) {
          this.$message.error(this.$t('aice.llm_image.community_image_fetch_failed'))
        }
      } finally {
        this.catalogLoading = false
      }
    },
    onItemSelect (item) {
      this.selectedItem = item
      this.resetImportForm()
    },
    clearItem () {
      this.selectedItem = null
      this.resetImportForm()
    },
    resetImportForm () {
      this.importForm.devices = [createEmptyDeviceRow()]
      this.$nextTick(() => {
        if (this.$refs.importFormRef) {
          this.$refs.importFormRef.clearValidate()
        }
      })
    },
    async validateImportForm () {
      if (!this.needsGpuSelection || !this.$refs.importFormRef) return true
      return new Promise(resolve => {
        this.$refs.importFormRef.validate(valid => resolve(valid))
      })
    },
    async handleImport () {
      if (!this.selectedItem || this.isItemImported) return
      const valid = await this.validateImportForm()
      if (!valid) return
      this.submitLoading = true
      try {
        const devices = this.needsGpuSelection ? this.importForm.devices : undefined
        const { skuError } = await createCommunityImageAndSku(this.selectedItem, {
          imagesManager: this.imagesManager,
          skusManager: this.skusManager,
          devices,
        })
        this.$set(this.existingImages, getCommunityImageKey(this.selectedItem), true)
        if (skuError) {
          this.$message.warning(this.$t('aice.llm_image.sku_auto_create_failed', [skuError?.message || skuError]))
        } else {
          this.$message.success(this.$t('common.success'))
          this.clearItem()
          this.$router.push(this.llmRouteCtx.skuListPath)
        }
      } catch (err) {
        if (err?.message) {
          this.$message.error(err.message)
        }
        throw err
      } finally {
        this.submitLoading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.catalog-grid-page-body {
  overflow: hidden;
}
</style>

<style lang="less" src="@Ai/sections/catalog-model-sets/catalog-model-page.less"></style>
<style lang="less" src="@Ai/sections/catalog-model-sets/catalog-drawer.less"></style>
<style>
.md-desc p {
  margin-bottom: 0;
}
.md-desc a {
  color: #1890ff;
}
</style>

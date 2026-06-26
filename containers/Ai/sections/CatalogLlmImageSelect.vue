<template>
  <div class="catalog-llm-image-select">
    <a-radio-group
      v-model="imageSourceTab"
      class="catalog-llm-image-select__tabs">
      <a-radio-button value="local">
        {{ $t('aice.llm_image.local_images') }}
      </a-radio-button>
      <a-radio-button value="community">
        {{ $t('aice.llm_image.community_images') }}
      </a-radio-button>
    </a-radio-group>
    <llm-image-select
      v-if="imageSourceTab === 'local'"
      class="catalog-llm-image-select__dropdown"
      :value="localSelectValue"
      :params="localImageParams"
      :select-props="localSelectProps"
      @change="onChange" />
    <a-select
      v-else
      class="catalog-llm-image-select__dropdown"
      :value="value"
      :loading="loading"
      show-search
      option-filter-prop="children"
      v-bind="communitySelectProps"
      @change="onChange">
      <a-select-option
        v-for="item in communityItems"
        :key="catalogValue(item)"
        :value="catalogValue(item)">
        <div class="catalog-llm-image-option">
          <div class="oc-selected-display-none">
            <div class="text-truncate catalog-llm-image-option__title">
              <span :title="communityTitle(item)">{{ communityTitle(item) }}</span>
              <a-tag
                v-if="isImported(item)"
                color="green"
                class="catalog-imported-tag ml-1">
                {{ $t('aice.llm_image.imported') }}
              </a-tag>
            </div>
            <div class="text-color-secondary text-truncate catalog-llm-image-option__meta" :title="item.image">
              {{ item.image }}
            </div>
          </div>
          <div
            class="oc-dropdown-display-none catalog-llm-image-option__selected text-truncate"
            :title="formatCommunitySelectedLabel(item)">
            <span>{{ communityTitle(item) }}</span>
            <a-tag
              v-if="isImported(item)"
              color="green"
              class="catalog-imported-tag ml-1">
              {{ $t('aice.llm_image.imported') }}
            </a-tag>
            <span class="text-color-secondary"> ({{ formatImageRef(item) }})</span>
          </div>
        </div>
      </a-select-option>
      <a-select-option v-if="!loading && !communityItems.length" disabled value="__empty_community__">
        {{ $t('aice.llm_image.no_image_options') }}
      </a-select-option>
    </a-select>
    <div v-if="imageSourceTab === 'community'" class="catalog-llm-image-select__hint text-color-secondary">
      {{ $t('aice.llm_image.community_catalog_hint') }}
    </div>
  </div>
</template>

<script>
import LlmImageSelect from '@Ai/sections/LlmImageSelect'
import { getParamsForType } from '@Ai/views/llm-sku/constants/llmTypeConfig'
import {
  buildCatalogImageGroups,
  buildLocalImageMapByRegistryRef,
  fetchCommunityImageItems,
  isCatalogImageValue,
  isCatalogItemImportedLocally,
  listLocalLlmImages,
  listLocalLlmImagesForRegistryMatch,
  toCatalogImageValue,
} from '@Ai/utils/communityImages'

const TAB_LOCAL = 'local'
const TAB_COMMUNITY = 'community'

export default {
  name: 'CatalogLlmImageSelect',
  components: {
    LlmImageSelect,
  },
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      default: undefined,
    },
    llmType: {
      type: String,
      required: true,
    },
    selectProps: {
      type: Object,
      default: () => ({}),
    },
    autoSelectDefault: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      loading: false,
      imageSourceTab: TAB_LOCAL,
      tabSyncing: false,
      localImages: [],
      communityItems: [],
      localImageMap: {},
      catalogItemsById: {},
      imagesManager: null,
      catalogManager: null,
    }
  },
  computed: {
    localSelectValue () {
      if (isCatalogImageValue(this.value)) return undefined
      return this.value
    },
    localImageParams () {
      return {
        limit: 100,
        scope: this.$store.getters.scope,
        details: true,
        $t: 1,
        ...getParamsForType(this.llmType),
      }
    },
    localSelectProps () {
      return {
        placeholder: this.$t('common.tips.select', [this.$t('aice.llm_image')]),
        ...this.selectProps,
      }
    },
    communitySelectProps () {
      return {
        dropdownStyle: { minWidth: '520px' },
        optionLabelProp: 'children',
        placeholder: this.$t('common.tips.select', [this.$t('aice.llm_image')]),
        ...this.selectProps,
      }
    },
  },
  watch: {
    llmType () {
      this.loadOptions()
    },
    value () {
      this.syncTabFromValue()
    },
    imageSourceTab (tab, prevTab) {
      if (tab !== prevTab && tab === TAB_COMMUNITY) {
        this.refreshLocalRegistryMap()
      }
      if (tab === prevTab || this.tabSyncing) return
      this.applyTabSelection(tab)
    },
  },
  created () {
    this.imagesManager = new this.$Manager('llm_images')
    this.catalogManager = new this.$Manager('llm_images_catalogs', 'v1')
    this.loadOptions()
  },
  methods: {
    catalogValue (item) {
      return toCatalogImageValue(item.id)
    },
    formatImageRef (item) {
      if (!item?.image_name) return item?.image || item?.name || ''
      const label = item.image_label || 'latest'
      return `${item.image_name}:${label}`
    },
    formatCommunitySelectedLabel (item) {
      const title = this.communityTitle(item)
      const ref = this.formatImageRef(item)
      const importedSuffix = this.isImported(item) ? ` ${this.$t('aice.llm_image.imported')}` : ''
      return `${title}${importedSuffix} (${ref})`
    },
    communityTitle (item) {
      if (item.description && item.description !== '-') return item.description
      if (item.image_label) return `${item.llm_type}-${item.image_label}`
      return item.llm_type || item.image || ''
    },
    isImported (item) {
      return isCatalogItemImportedLocally(item, this.localImageMap)
    },
    getCatalogItem (catalogId) {
      return this.catalogItemsById[catalogId] || null
    },
    valueBelongsToTab (tab, val = this.value) {
      if (val == null || val === '') return false
      if (tab === TAB_COMMUNITY) return isCatalogImageValue(val)
      return !isCatalogImageValue(val)
    },
    syncTabFromValue () {
      if (this.value == null || this.value === '') return
      this.tabSyncing = true
      this.imageSourceTab = isCatalogImageValue(this.value) ? TAB_COMMUNITY : TAB_LOCAL
      this.$nextTick(() => {
        this.tabSyncing = false
      })
    },
    resolveDefaultTab () {
      if (this.localImages.length) return TAB_LOCAL
      if (this.communityItems.length) return TAB_COMMUNITY
      return TAB_LOCAL
    },
    resolveDefaultValue () {
      if (this.localImages.length) return this.localImages[0].id
      if (this.communityItems.length) return this.catalogValue(this.communityItems[0])
      return undefined
    },
    applyTabSelection (tab) {
      if (this.valueBelongsToTab(tab)) return
      this.onChange(undefined)
    },
    async refreshLocalRegistryMap () {
      if (!this.imagesManager) return
      try {
        const scope = this.$store.getters.scope
        const registryImages = await listLocalLlmImagesForRegistryMatch(this.imagesManager, scope)
        this.localImageMap = buildLocalImageMapByRegistryRef(registryImages)
      } catch (e) {
        // ignore
      }
    },
    async loadOptions () {
      if (!this.llmType) {
        this.localImages = []
        this.communityItems = []
        this.localImageMap = {}
        this.catalogItemsById = {}
        return
      }
      this.loading = true
      let catalogItems = []
      let localImages = []
      try {
        const scope = this.$store.getters.scope
        const [catalogResult, localResult, registryResult] = await Promise.allSettled([
          fetchCommunityImageItems([this.llmType], this.catalogManager),
          listLocalLlmImages(this.imagesManager, this.llmType, scope),
          listLocalLlmImagesForRegistryMatch(this.imagesManager, scope),
        ])
        if (catalogResult.status === 'fulfilled') {
          catalogItems = catalogResult.value || []
        }
        if (localResult.status === 'fulfilled') {
          localImages = localResult.value || []
        }
        const registryImages = registryResult.status === 'fulfilled'
          ? (registryResult.value || [])
          : localImages
        const byId = {}
        catalogItems.forEach(item => {
          if (item?.id) byId[item.id] = item
        })
        this.catalogItemsById = byId
        const groups = buildCatalogImageGroups(catalogItems, localImages, { registryImages })
        this.localImages = groups.localImages
        this.communityItems = groups.communityItems
        this.localImageMap = groups.localImageMap
        this.$emit('catalog-loaded', {
          localImages: this.localImages,
          communityItems: this.communityItems,
          localImageMap: this.localImageMap,
          catalogItemsById: this.catalogItemsById,
        })
        if (this.value != null && this.value !== '') {
          this.syncTabFromValue()
        } else if (this.autoSelectDefault) {
          this.tabSyncing = true
          this.imageSourceTab = this.resolveDefaultTab()
          const defaultVal = this.resolveDefaultValue()
          this.$nextTick(() => {
            this.tabSyncing = false
          })
          if (defaultVal != null) {
            this.onChange(defaultVal)
          }
        } else {
          this.tabSyncing = true
          this.imageSourceTab = this.resolveDefaultTab()
          this.$nextTick(() => {
            this.tabSyncing = false
          })
        }
      } catch (e) {
        this.localImages = localImages
        this.communityItems = []
        this.localImageMap = buildCatalogImageGroups([], localImages).localImageMap
      } finally {
        this.loading = false
      }
    },
    onChange (val) {
      this.$emit('change', val)
      this.$emit('input', val)
    },
  },
}
</script>

<style lang="less" scoped>
.catalog-llm-image-select {
  width: 100%;
}
.catalog-llm-image-select__tabs {
  margin-bottom: 8px;
}
.catalog-llm-image-select__dropdown {
  width: 100%;
  ::v-deep .ant-select-selection__rendered {
    overflow: hidden;
  }
  ::v-deep .ant-select-selection-selected-value {
    float: none;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
.catalog-llm-image-select__hint {
  margin-top: 4px;
  font-size: 12px;
  line-height: 18px;
}
.catalog-llm-image-option__meta {
  font-size: 12px;
  line-height: 18px;
}
.catalog-llm-image-option__title {
  line-height: 22px;
}
.catalog-imported-tag {
  flex-shrink: 0;
  margin: 0;
}
.catalog-llm-image-option__selected {
  line-height: 22px;
}
</style>

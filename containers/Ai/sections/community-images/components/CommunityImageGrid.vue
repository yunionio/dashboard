<!--
  社区容器镜像卡片列表（llmimages.yaml），供 Agent 模板导入等场景使用。
-->
<template>
  <div class="community-image-grid">
    <a-row :gutter="8" class="mb-3">
      <a-col :span="10">
        <a-input-search
          v-model="filter.search"
          :placeholder="$t('aice.llm_catalog.search.placeholder')"
          allow-clear
          @search="applyFilter"
          @change="onFilterChange" />
      </a-col>
      <a-col :span="10">
        <a-select
          v-model="filter.llmType"
          :placeholder="$t('aice.llm_image.filter_by_type')"
          allow-clear
          style="width: 100%"
          :dropdown-match-select-width="false"
          @change="applyFilter">
          <a-select-option v-for="opt in llmTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="4" style="text-align: right;">
        <a-button
          shape="circle"
          icon="reload"
          :loading="refreshing"
          :title="$t('common.refresh')"
          @click="refresh" />
      </a-col>
    </a-row>

    <a-spin :spinning="gridLoading">
      <a-empty v-if="!gridLoading && filteredItems.length === 0" />
      <div v-else class="catalog-grid">
        <a-card
          v-for="item in filteredItems"
          :key="itemKey(item)"
          hoverable
          class="catalog-card"
          :class="{ 'catalog-card--imported': isImported(item) }"
          @click="$emit('select', item)">
          <div class="catalog-card-header">
            <img v-if="item.icon" :src="item.icon" class="catalog-icon" alt="" />
            <div v-else class="catalog-icon catalog-icon-name" :title="displayTitle(item)">
              {{ displayTitle(item).slice(0, 2) }}
            </div>
            <div class="catalog-card-title">
              <div class="catalog-title-row">
                <div class="catalog-name" :title="displayTitle(item)">{{ displayTitle(item) }}</div>
                <a-tag
                  v-if="isImported(item)"
                  color="green"
                  class="catalog-imported-tag">
                  {{ $t('aice.llm_image.imported') }}
                </a-tag>
              </div>
              <div v-if="hasCardMeta(item)" class="catalog-subtitle">
                <a-tag v-if="isDesktopCommunityItem(item)" class="catalog-type-tag">
                  {{ llmTypeLabel(item.llm_type) }}
                </a-tag>
                <span
                  v-if="itemSubtitle(item)"
                  class="catalog-app-name"
                  :title="itemSubtitle(item)">
                  {{ itemSubtitle(item) }}
                </span>
              </div>
            </div>
          </div>
          <div class="catalog-desc">{{ shortDesc(item.description) }}</div>
        </a-card>
      </div>
    </a-spin>
  </div>
</template>

<script>
import {
  fetchCommunityImageItems,
  formatCommunityDisplayTitle,
  getCommunityImageKey,
  getCommunityItemSubtitle,
  isCommunityImageImported,
  isDesktopCommunityItem,
} from '@Ai/utils/communityImages'

export default {
  name: 'CommunityImageGrid',
  props: {
    allowedTypes: {
      type: Array,
      default: () => [],
    },
    catalogItems: {
      type: Array,
      default: null,
    },
    existingImages: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      localLoading: false,
      refreshing: false,
      localItems: [],
      catalogManager: new this.$Manager('llm_images_catalogs', 'v1'),
      filter: {
        search: '',
        llmType: undefined,
      },
      filterDebounce: null,
    }
  },
  computed: {
    useExternalItems () {
      return Array.isArray(this.catalogItems)
    },
    gridLoading () {
      return this.useExternalItems ? this.loading : this.localLoading
    },
    items () {
      return this.useExternalItems ? this.catalogItems : this.localItems
    },
    llmTypeOptions () {
      const allowed = new Set(this.allowedTypes)
      const seen = {}
      const opts = []
      this.items.forEach(item => {
        const t = item.llm_type
        if (t && allowed.has(t) && !seen[t]) {
          seen[t] = true
          opts.push({ value: t, label: this.llmTypeLabel(t) })
        }
      })
      return opts.sort((a, b) => a.label.localeCompare(b.label))
    },
    filteredItems () {
      let list = this.items
      if (this.filter.llmType) {
        list = list.filter(item => item.llm_type === this.filter.llmType)
      }
      const kw = (this.filter.search || '').trim().toLowerCase()
      if (!kw) return list
      return list.filter(item => {
        const haystack = [
          item.image,
          item.image_name,
          item.image_label,
          item.llm_type,
          item.app_name,
          item.name,
          item.description,
        ].join(' ').toLowerCase()
        return haystack.includes(kw)
      })
    },
  },
  watch: {
    allowedTypes: {
      handler () {
        if (!this.useExternalItems) {
          this.fetchList()
        }
      },
      deep: true,
    },
  },
  created () {
    if (!this.useExternalItems) {
      this.fetchList()
    }
  },
  methods: {
    itemKey (item) {
      return getCommunityImageKey(item) || item.id
    },
    isImported (item) {
      return isCommunityImageImported(item, this.existingImages)
    },
    isDesktopCommunityItem,
    displayTitle (item) {
      return formatCommunityDisplayTitle(item, type => this.llmTypeLabel(type))
    },
    itemSubtitle (item) {
      return getCommunityItemSubtitle(item)
    },
    hasCardMeta (item) {
      return this.isDesktopCommunityItem(item) || !!this.itemSubtitle(item)
    },
    llmTypeLabel (type) {
      if (!type) return '-'
      const key = `aice.llm_type.${String(type).replace(/-/g, '_')}`
      return this.$te(key) ? this.$t(key) : type
    },
    onFilterChange () {
      if (this.filterDebounce) clearTimeout(this.filterDebounce)
      this.filterDebounce = setTimeout(() => this.applyFilter(), 300)
    },
    applyFilter () {},
    async fetchList () {
      if (this.useExternalItems) return
      this.localLoading = true
      try {
        this.localItems = await fetchCommunityImageItems(this.allowedTypes, this.catalogManager)
      } catch (e) {
        if (e && !e.__CANCEL__) {
          this.$message.error(this.$t('aice.llm_image.community_image_fetch_failed'))
        }
        this.localItems = []
      } finally {
        this.localLoading = false
      }
    },
    async refresh () {
      this.refreshing = true
      try {
        if (this.useExternalItems) {
          this.$emit('refresh')
        } else {
          await this.fetchList()
          this.$emit('refresh')
        }
        this.$message.success(this.$t('common.success'))
      } finally {
        this.refreshing = false
      }
    },
    shortDesc (s) {
      if (!s || s === '-') return ''
      const trimmed = String(s).trim()
      return trimmed.length > 100 ? trimmed.slice(0, 97) + '…' : trimmed
    },
  },
}
</script>

<style scoped>
.community-image-grid {
  min-height: 0;
}
.community-image-grid ::v-deep .ant-spin-nested-loading,
.community-image-grid ::v-deep .ant-spin-container {
  height: auto;
  overflow: visible;
}
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
@media (max-width: 1200px) {
  .catalog-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 992px) {
  .catalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 576px) {
  .catalog-grid { grid-template-columns: 1fr; }
}
.catalog-card {
  cursor: pointer;
  height: 100%;
}
.catalog-card--imported {
  opacity: 0.85;
}
.catalog-card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}
.catalog-icon {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 12px;
  object-fit: contain;
  background: #fafafa;
  flex-shrink: 0;
}
.catalog-icon-name {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f1f5;
  color: #666;
  font-weight: 600;
  font-size: 12px;
}
.catalog-card-title {
  flex: 1;
  min-width: 0;
}
.catalog-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}
.catalog-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.catalog-imported-tag {
  flex-shrink: 0;
  margin: 0;
}
.catalog-subtitle {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  min-width: 0;
}
.catalog-type-tag {
  flex-shrink: 0;
  margin: 0;
}
.catalog-app-name {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.catalog-desc {
  font-size: 12px;
  color: #666;
  min-height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>

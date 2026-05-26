<!--
  社区模型库卡片列表：按 tag 展平，每个 tag 一张卡片。
-->
<template>
  <div class="community-model-grid">
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
          v-model="filter.modelName"
          :placeholder="$t('aice.llm_image.community_filter_model.placeholder')"
          allow-clear
          show-search
          option-filter-prop="children"
          style="width: 100%"
          :dropdown-match-select-width="false"
          @change="applyFilter">
          <a-select-option v-for="name in modelNameOptions" :key="name" :value="name">
            {{ name }}
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

    <a-spin :spinning="loading">
      <a-empty v-if="!loading && filteredItems.length === 0" />
      <div v-else class="catalog-grid">
        <a-card
          v-for="item in filteredItems"
          :key="item.full_name"
          hoverable
          class="catalog-card"
          @click="$emit('select', item)">
          <div class="catalog-card-header">
            <img v-if="getModelIcon(item.model_name)" :src="getModelIcon(item.model_name)" class="catalog-icon" alt="" />
            <div v-else class="catalog-icon catalog-icon-name" :title="item.full_name">
              {{ getModelIconLabel(item.full_name) }}
            </div>
            <div class="catalog-card-title">
              <div class="catalog-name">{{ item.full_name }}</div>
              <div class="catalog-subtitle">
                <span>{{ item.context_length || '-' }} · {{ item.model_size || '-' }}</span>
                <a-tag v-if="item.is_latest" color="green" class="latest-tag">latest</a-tag>
              </div>
            </div>
          </div>
          <div class="catalog-desc">{{ shortDesc(item.description) }}</div>
          <div class="catalog-tags">
            <a-tag v-for="cap in (item.capabilities || []).slice(0, 4)" :key="cap">{{ cap }}</a-tag>
          </div>
        </a-card>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { buildCommunityTagItems } from '@Ai/utils/communityRegistry'
import { getModelIcon, getModelIconLabel } from '@Ai/utils/index'

export default {
  name: 'CommunityModelGrid',
  data () {
    return {
      loading: false,
      refreshing: false,
      items: [],
      filter: {
        search: '',
        modelName: undefined,
      },
      filterDebounce: null,
      instantModelsManager: new this.$Manager('llm_instant_models'),
    }
  },
  computed: {
    modelNameOptions () {
      const names = new Set()
      this.items.forEach(item => {
        if (item.model_name) names.add(item.model_name)
      })
      return Array.from(names).sort((a, b) => a.localeCompare(b))
    },
    filteredItems () {
      let list = this.items
      if (this.filter.modelName) {
        list = list.filter(item => item.model_name === this.filter.modelName)
      }
      const kw = (this.filter.search || '').trim().toLowerCase()
      if (!kw) return list
      return list.filter(item => {
        const haystack = [
          item.full_name,
          item.model_name,
          item.tag_name,
          item.description,
          ...(item.capabilities || []),
          item.context_length,
          item.model_size,
        ].join(' ').toLowerCase()
        return haystack.includes(kw)
      })
    },
  },
  created () {
    this.fetchList()
  },
  methods: {
    getModelIcon,
    getModelIconLabel,
    onFilterChange () {
      if (this.filterDebounce) clearTimeout(this.filterDebounce)
      this.filterDebounce = setTimeout(() => this.applyFilter(), 300)
    },
    applyFilter () {},
    async fetchList () {
      this.loading = true
      try {
        const res = await this.instantModelsManager.get({ id: 'community-registry' })
        const doc = res?.data || {}
        this.items = buildCommunityTagItems(doc).filter(i => i && i.full_name)
      } catch (e) {
        this.$message.error(this.$t('aice.llm_image.community_registry_fetch_failed'))
        this.items = []
      } finally {
        this.loading = false
      }
    },
    async refresh () {
      this.refreshing = true
      try {
        await this.fetchList()
        this.$message.success(this.$t('common.success'))
      } finally {
        this.refreshing = false
      }
    },
    shortDesc (s) {
      if (!s) return ''
      const trimmed = s.trim()
      return trimmed.length > 100 ? trimmed.slice(0, 97) + '…' : trimmed
    },
  },
}
</script>

<style scoped>
.community-model-grid {
  min-height: 0;
}
.community-model-grid ::v-deep .ant-spin-nested-loading,
.community-model-grid ::v-deep .ant-spin-container {
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
.catalog-card { cursor: pointer; }
.catalog-card-header { display: flex; align-items: center; margin-bottom: 8px; }
.catalog-icon { width: 40px; height: 40px; border-radius: 4px; margin-right: 12px; object-fit: contain; background: #fafafa; flex-shrink: 0; }
.catalog-icon-name {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f1f5;
  color: #666;
  font-weight: 600;
  font-size: 12px;
}
.catalog-card-title { flex: 1; min-width: 0; }
.catalog-name { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.catalog-subtitle {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}
.latest-tag { margin: 0 !important; }
.catalog-desc { font-size: 12px; color: #666; min-height: 36px; overflow: hidden; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.catalog-tags { display: flex; flex-wrap: wrap; gap: 4px; }
</style>

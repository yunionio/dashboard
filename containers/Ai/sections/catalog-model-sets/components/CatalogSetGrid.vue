<!--
  模型目录卡片列表：搜索、分类筛选、分页。
  点击卡片向父组件 emit('select', set)，由目录导入/部署页打开 drawer 填写规格与表单。
-->
<template>
  <div ref="root" class="catalog-set-grid" :style="containerStyle">
    <div class="catalog-set-grid__toolbar">
      <a-row :gutter="8">
        <a-col :span="10">
          <a-input-search
            v-model="filter.search"
            :placeholder="$t('aice.llm_catalog.search.placeholder')"
            allow-clear
            @search="fetchList"
            @change="onFilterChange" />
        </a-col>
        <a-col :span="10">
          <a-select
            v-model="filter.category"
            :placeholder="$t('aice.llm_catalog.category.placeholder')"
            allow-clear
            style="width: 100%"
            :dropdown-match-select-width="false"
            @change="fetchList">
            <a-select-option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
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
    </div>

    <a-spin :spinning="loading" class="catalog-set-grid__body">
      <a-empty v-if="!loading && sets.length === 0" />
      <div v-else ref="scroll" class="catalog-set-grid__scroll" :style="scrollStyle">
        <a-row :gutter="[12, 12]">
          <a-col v-for="set in sets" :key="set.name" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card hoverable class="catalog-card" @click="$emit('select', set)">
              <div class="catalog-card-header">
                <img v-if="getModelIcon(set.name)" :src="getModelIcon(set.name)" class="catalog-icon" alt="" />
                <div v-else class="catalog-icon catalog-icon-name" :title="set.name">
                  {{ getModelIconLabel(set.name) }}
                </div>
                <div class="catalog-card-title">
                  <div class="catalog-name">{{ set.name }}</div>
                  <div class="catalog-subtitle">
                    <span v-if="set.size">{{ formatSize(set) }}</span>
                    <span v-if="(set.specs || []).length > 0">
                      · {{ (set.specs || []).length }} {{ $t('aice.llm_catalog.specs') }}
                    </span>
                  </div>
                  <div v-if="set.downloads || set.likes" class="catalog-popularity">
                    <span v-if="set.downloads">⬇ {{ formatCount(set.downloads) }}</span>
                    <span v-if="set.likes">♥ {{ formatCount(set.likes) }}</span>
                  </div>
                </div>
              </div>
              <div class="catalog-desc">{{ shortDesc(set.description) }}</div>
              <div class="catalog-tags">
                <a-tag v-for="cat in set.categories" :key="`c-${cat}`" color="blue">{{ cat }}</a-tag>
                <a-tag v-for="cap in (set.capabilities || []).slice(0, 3)" :key="`cap-${cap}`">{{ cap }}</a-tag>
              </div>
              <div v-if="(set.specs || []).length > 0" class="catalog-backends">
                <a-tag v-for="b in uniqueBackends(set)" :key="`b-${b}`" color="purple">{{ b }}</a-tag>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-spin>

    <div ref="pager" class="catalog-set-grid__pager">
      <a-pagination
        v-if="total > pageSize"
        :total="total"
        :current.sync="page"
        :page-size="pageSize"
        @change="onPageChange" />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getModelIcon, getModelIconLabel } from '@Ai/utils/index'

const MIN_SCROLL_HEIGHT = 400
const BOTTOM_MARGIN = 15

/** 拉取 llm_model_sets 并以卡片网格展示，供导入/部署页选模型 */
export default {
  name: 'CatalogSetGrid',
  data () {
    return {
      loading: false,
      refreshing: false,
      sets: [],
      total: 0,
      page: 1,
      pageSize: 20,
      filter: {
        search: '',
        category: null,
      },
      setsManager: new this.$Manager('llm_model_sets', 'v1'),
      filterDebounce: null,
      containerHeight: MIN_SCROLL_HEIGHT,
      heightTimers: [],
    }
  },
  computed: {
    ...mapGetters(['isSidepageOpen']),
    ...mapState('common', {
      cloudShellHeight: state => (state.openCloudShell ? state.cloudShellHeight : 0),
    }),
    categoryOptions () {
      return [
        { value: 'llm', label: this.$t('aice.llm_catalog.category.llm') },
        { value: 'embedding', label: this.$t('aice.llm_catalog.category.embedding') },
        { value: 'reranker', label: this.$t('aice.llm_catalog.category.reranker') },
        { value: 'image', label: this.$t('aice.llm_catalog.category.image') },
        { value: 'speech_to_text', label: this.$t('aice.llm_catalog.category.stt') },
        { value: 'text_to_speech', label: this.$t('aice.llm_catalog.category.tts') },
      ]
    },
    containerStyle () {
      if (this.isSidepageOpen) return { overflow: 'hidden' }
      return {
        height: `${this.containerHeight}px`,
        overflow: 'hidden',
      }
    },
    scrollStyle () {
      return {
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
      }
    },
  },
  watch: {
    loading () {
      this.scheduleInitHeight()
    },
    sets () {
      this.scheduleInitHeight()
    },
    total () {
      this.scheduleInitHeight()
    },
    cloudShellHeight () {
      this.initHeight()
    },
  },
  created () {
    this.fetchList()
  },
  mounted () {
    this.$bus.$on('GlobalTopAlertUpdate', this.onGlobalTopAlertUpdate)
    this.scheduleInitHeight()
    window.addEventListener('resize', this.initHeight)
  },
  beforeDestroy () {
    this.$bus.$off('GlobalTopAlertUpdate', this.onGlobalTopAlertUpdate)
    window.removeEventListener('resize', this.initHeight)
    this.heightTimers.forEach(clearTimeout)
    if (this.filterDebounce) clearTimeout(this.filterDebounce)
  },
  methods: {
    getModelIcon,
    getModelIconLabel,
    onGlobalTopAlertUpdate () {
      this.scheduleInitHeight()
    },
    scheduleInitHeight () {
      this.$nextTick(() => {
        this.initHeight()
        this.heightTimers.forEach(clearTimeout)
        this.heightTimers = [100, 500].map(delay => setTimeout(() => this.initHeight(), delay))
      })
    },
    initHeight () {
      const root = this.$refs.root
      if (!root) return
      if (this.isSidepageOpen) {
        this.containerHeight = MIN_SCROLL_HEIGHT
        return
      }
      const rootTop = root.getBoundingClientRect().y
      const wH = document.body.offsetHeight
      const calculatedHeight = wH - rootTop - BOTTOM_MARGIN - this.cloudShellHeight
      this.containerHeight = calculatedHeight > MIN_SCROLL_HEIGHT ? calculatedHeight : MIN_SCROLL_HEIGHT
    },
    onFilterChange () {
      if (this.filterDebounce) clearTimeout(this.filterDebounce)
      this.filterDebounce = setTimeout(() => this.fetchList(), 300)
    },
    onPageChange (page) {
      this.page = page
      this.fetchList()
    },
    async fetchList () {
      this.loading = true
      try {
        const params = {
          limit: this.pageSize,
          offset: (this.page - 1) * this.pageSize,
        }
        if (this.filter.search) params.search = this.filter.search
        if (this.filter.category) params.category = this.filter.category
        const res = await this.setsManager.list({ params })
        this.sets = res.data?.data || []
        this.total = res.data?.total ?? this.sets.length
      } catch (e) {
        this.$message.error(this.$t('aice.llm_catalog.fetch_failed'))
      } finally {
        this.loading = false
      }
    },
    async refresh () {
      this.refreshing = true
      try {
        await this.setsManager.performClassAction({ action: 'refresh' })
        this.$message.success(this.$t('common.success'))
        await this.fetchList()
      } catch (e) {
        this.$message.error(this.$t('aice.llm_catalog.refresh_failed'))
      } finally {
        this.refreshing = false
      }
    },
    shortDesc (s) {
      if (!s) return ''
      const trimmed = s.trim()
      return trimmed.length > 100 ? trimmed.slice(0, 97) + '…' : trimmed
    },
    formatSize (set) {
      const unit = set.size_unit || 'B'
      return `${set.size}${unit}`
    },
    formatCount (n) {
      if (n == null) return '-'
      const v = Number(n)
      if (!Number.isFinite(v)) return '-'
      if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
      if (v >= 1e3) return (v / 1e3).toFixed(1) + 'k'
      return String(v)
    },
    uniqueBackends (set) {
      const seen = new Set()
      ;(set.specs || []).forEach(sp => sp.backend && seen.add(sp.backend))
      return Array.from(seen)
    },
  },
}
</script>

<style scoped>
.catalog-set-grid {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.catalog-set-grid__toolbar {
  flex-shrink: 0;
  margin-bottom: 12px;
}
.catalog-set-grid__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.catalog-set-grid__body ::v-deep .ant-spin-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.catalog-set-grid__scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
}
.catalog-set-grid__pager {
  flex-shrink: 0;
  padding-top: 12px;
  text-align: left;
}
.catalog-popularity {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}
.catalog-card { height: 100%; cursor: pointer; }
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
.catalog-subtitle { font-size: 12px; color: #999; }
.catalog-desc { font-size: 12px; color: #666; height: 36px; overflow: hidden; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.catalog-tags, .catalog-backends { display: flex; flex-wrap: wrap; gap: 4px; }
.catalog-backends { margin-top: 6px; }
</style>

<template>
  <div class="aiproxy-usage-page">
    <page-header
      :title="$t('aice.aiproxy.usage.title')"
      :tabs="tabs"
      :currentTab.sync="currentTab" />
    <page-body>
      <filter-bar
        v-if="currentTab !== 'events'"
        ref="filterBar"
        :filters="filters"
        @update:filters="onFiltersUpdate" />
      <truncated-alert :visible="truncated" />
      <div v-show="currentTab === 'overview'" class="mt-3">
        <overview-tab
          :filters="filters"
          :loading="overviewLoading"
          :data="overviewData" />
      </div>
      <div v-show="currentTab === 'analysis'" class="mt-3">
        <analysis-tab
          v-if="analysisInited"
          :filters="filters"
          :loading="analysisLoading"
          :data="analysisData" />
      </div>
      <div v-show="currentTab === 'events'" class="mt-3">
        <events-tab
          v-if="eventsInited"
          :active="currentTab === 'events'"
          :filters="filters"
          @update:filters="onFiltersUpdate"
          @truncated-change="onEventsTruncated" />
      </div>
    </page-body>
  </div>
</template>

<script>
import { buildDefaultFilters, buildUsageQueryParams } from './constants'
import TruncatedAlert from './components/TruncatedAlert'
import FilterBar from './components/FilterBar'
import OverviewTab from './components/OverviewTab'
import AnalysisTab from './components/AnalysisTab'
import EventsTab from './components/EventsTab'

export default {
  name: 'AiProxyUsage',
  components: {
    TruncatedAlert,
    FilterBar,
    OverviewTab,
    AnalysisTab,
    EventsTab,
  },
  data () {
    return {
      tabs: [
        { key: 'overview', label: this.$t('aice.aiproxy.usage.overview') },
        { key: 'analysis', label: this.$t('aice.aiproxy.usage.analysis') },
        { key: 'events', label: this.$t('aice.aiproxy.usage.events') },
      ],
      currentTab: 'overview',
      filters: buildDefaultFilters(),
      // 各 tab 上次请求时的 filters 快照（用于判断是否需要重新请求）
      cachedFilters: { overview: null, analysis: null },
      overviewLoading: false,
      overviewData: null,
      analysisLoading: false,
      analysisData: {},
      analysisInited: false,
      eventsInited: false,
      truncated: false,
      manager: null,
    }
  },
  watch: {
    currentTab (tab) {
      if (tab === 'analysis' && !this.analysisInited) {
        this.analysisInited = true
        this.$nextTick(() => this.tryFetchTab(tab))
        return
      }
      if (tab === 'events' && !this.eventsInited) {
        this.eventsInited = true
        return
      }
      this.tryFetchTab(tab)
    },
  },
  created () {
    this.manager = new this.$Manager('ai_proxy_usage', 'v2')
    this.tryFetchTab('overview')
  },
  methods: {
    /* 当前 tab 的 filters 与上次请求时不同则重新请求 */
    tryFetchTab (tab) {
      const snapshot = JSON.stringify(this.filters)
      if (this.cachedFilters[tab] === snapshot) return
      this.cachedFilters[tab] = snapshot
      if (tab === 'overview') this.fetchOverview()
      else if (tab === 'analysis') this.fetchAnalysis()
    },
    onFiltersUpdate (newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.tryFetchTab(this.currentTab)
    },
    async fetchOverview () {
      this.overviewLoading = true
      this.truncated = false
      try {
        const params = buildUsageQueryParams(this.filters)
        const { data = {} } = await this.manager.get({ id: 'overview', params })
        this.overviewData = data
        this.truncated = !!data.truncated
      } catch (err) {
        console.error('fetch overview failed', err)
      } finally {
        this.overviewLoading = false
      }
    },
    async fetchAnalysis () {
      this.analysisLoading = true
      try {
        const params = buildUsageQueryParams(this.filters)
        const { data = {} } = await this.manager.get({ id: 'analysis', params })
        this.analysisData = data
        if (data.truncated) this.truncated = true
      } catch (err) {
        console.error('fetch analysis failed', err)
      } finally {
        this.analysisLoading = false
      }
    },
    onEventsTruncated (val) {
      if (val) this.truncated = true
    },
  },
}
</script>

<style lang="less" scoped>
.aiproxy-usage-page {
  overflow-x: hidden;
  min-width: 0;
}
</style>

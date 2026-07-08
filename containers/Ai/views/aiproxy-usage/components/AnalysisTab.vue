<template>
  <div>
    <!-- 区块 B：延迟诊断 -->
    <div class="monitor-overview-chart mb-3">
      <div class="header">
        <div class="title-wrapper">
          <div class="title">{{ $t('aice.aiproxy.usage.latency_diagnostics') }}</div>
        </div>
      </div>
      <div class="latency-cards" v-if="!loading">
        <div class="latency-card" v-for="item in latencyItems" :key="item.key">
          <div class="latency-label">{{ item.label }}</div>
          <div class="latency-value">{{ item.value }}</div>
        </div>
        <div v-if="!latencyItems.length" class="no-data">-</div>
      </div>
      <a-spin v-else />
    </div>

    <!-- 区块 C：时段热力图 -->
    <div class="monitor-overview-chart mb-3">
      <div class="header header-with-actions">
        <div class="title-wrapper">
          <div class="title">{{ $t('aice.aiproxy.usage.heatmap') }}</div>
        </div>
        <a-select v-model="heatmapMetric" size="small" class="metric-select">
          <a-select-option v-for="item in heatmapMetricOptions" :key="item.key" :value="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </div>
      <heatmap-chart :loading="loading" :data="heatmapData" :value-key="heatmapMetric" />
    </div>

    <!-- 区块 D：构成分析（2×2 饼图） -->
    <div class="monitor-overview-chart mb-3">
      <div class="header header-with-actions mb-1">
        <div class="title-wrapper">
          <div class="title">{{ $t('aice.aiproxy.usage.composition') }}</div>
        </div>
        <a-select v-model="compositionMetric" size="small" class="metric-select">
          <a-select-option v-for="item in compositionMetricOptions" :key="item.key" :value="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </div>
      <a-row :gutter="16">
        <a-col :span="12" class="mb-3" v-for="ring in ringCharts" :key="ring.id">
          <div class="composition-chart-wrapper">
            <overview-ring
              :id="ring.id"
              :title="ring.title"
              :subtitle="ring.subtitle"
              chartHeigth="280px"
              :yAxisFormat="compositionYAxisFormat"
              :chartData="ring.chartData"
              :loading="loading" />
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 区块 E：模型效率 -->
    <div class="monitor-overview-chart mb-3">
      <div class="header mb-1">
        <div class="title-wrapper">
          <div class="title">{{ $t('aice.aiproxy.usage.model_efficiency') }}</div>
        </div>
      </div>
      <a-spin :spinning="loading" class="table-loading-wrap">
        <vxe-grid
          ref="grid"
          :data="currentPageData"
          :columns="vxeEfficiencyColumns"
          show-header-overflow
          show-overflow
          highlight-hover-row
          resizable
          size="small">
          <template v-slot:empty>
            <loader :loading="false" :noDataText="$t('common.notData')" />
          </template>
          <template v-slot:pager>
            <vxe-pager
              :current-page="page.currentPage"
              :page-size="page.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="page.total"
              :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'Sizes', 'Total']"
              @page-change="handlePageChange" />
          </template>
        </vxe-grid>
      </a-spin>
    </div>
  </div>
</template>

<script>
import OverviewRing from '@Monitor/components/MonitorCard/sections/chart/ring'
import HeatmapChart from './HeatmapChart'
import { compositionToRingChart } from '../utils/transformChart'

const COMPOSITION_METRIC_KEYS = [
  'failure_count',
  'request_count',
  'success_count',
  'success_rate',
  'output_tokens',
  'input_tokens',
  'token_count',
  'total_cost',
]

export default {
  name: 'AiproxyUsageAnalysisTab',
  components: { OverviewRing, HeatmapChart },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      heatmapMetric: 'request_count',
      compositionMetric: 'request_count',
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0,
      },
    }
  },
  computed: {
    heatmapMetricOptions () {
      return [
        { key: 'request_count', label: this.$t('aice.aiproxy.usage.request_count_short') },
        { key: 'token_count', label: this.$t('aice.aiproxy.usage.metric_token_count') },
      ]
    },
    compositionMetricOptions () {
      const labelMap = {
        failure_count: this.$t('aice.aiproxy.usage.failure_count'),
        request_count: this.$t('aice.aiproxy.usage.request_count_short'),
        success_count: this.$t('aice.aiproxy.usage.success_count'),
        success_rate: this.$t('aice.aiproxy.usage.success_rate_short'),
        output_tokens: this.$t('aice.aiproxy.usage.output_tokens'),
        input_tokens: this.$t('aice.aiproxy.usage.input_tokens'),
        token_count: this.$t('aice.aiproxy.usage.token_count'),
        total_cost: this.$t('aice.aiproxy.usage.total_cost'),
      }
      return COMPOSITION_METRIC_KEYS.map(key => ({
        key,
        label: labelMap[key],
      }))
    },
    compositionYAxisFormat () {
      if (this.compositionMetric === 'success_rate') return '0.[00]%'
      if (this.compositionMetric === 'total_cost') return '0.[0000]'
      return '0'
    },
    ringCharts () {
      const comps = [
        { id: 'ring-api-key', key: 'api_key_composition', title: this.$t('aice.aiproxy.usage.api_key_composition'), nameKey: 'name' },
        { id: 'ring-model', key: 'model_composition', title: this.$t('aice.aiproxy.usage.model_composition'), nameKey: 'name' },
        { id: 'ring-auth', key: 'auth_files_composition', title: this.$t('aice.aiproxy.usage.auth_source'), nameKey: 'name' },
        { id: 'ring-provider', key: 'ai_provider_composition', title: this.$t('aice.aiproxy.usage.provider_composition'), nameKey: 'name' },
      ]
      return comps.map(c => {
        const chart = compositionToRingChart(this.data[c.key] || [], {
          nameKey: c.nameKey,
          valueKey: this.compositionMetric,
        })
        return { ...c, ...chart }
      })
    },
    heatmapData () {
      return this.data.heatmap || []
    },
    efficiencyData () {
      return (this.data.model_efficiency || []).map((item, i) => ({ ...item, _idx: i }))
    },
    currentPageData () {
      if (!this.efficiencyData.length) return []
      const { currentPage, pageSize } = this.page
      const start = (currentPage - 1) * pageSize
      return this.efficiencyData.slice(start, start + pageSize)
    },
    vxeEfficiencyColumns () {
      return [
        { title: this.$t('aice.aiproxy.usage.model'), field: 'model', minWidth: 180, formatter: ({ cellValue }) => cellValue ?? '-' },
        { title: this.$t('aice.aiproxy.usage.request_count_short'), field: 'request_count', minWidth: 100, formatter: ({ cellValue }) => cellValue ?? 0 },
        { title: this.$t('aice.aiproxy.usage.tokens_per_request'), field: 'tokens_per_request', minWidth: 120, formatter: ({ cellValue }) => cellValue != null ? cellValue.toFixed(1) : '-' },
        { title: this.$t('aice.aiproxy.usage.output_tokens_per_request'), field: 'output_tokens_per_request', minWidth: 140, formatter: ({ cellValue }) => cellValue != null ? cellValue.toFixed(1) : '-' },
        { title: this.$t('aice.aiproxy.usage.cost_per_request'), field: 'cost_per_request', minWidth: 120, formatter: ({ cellValue }) => cellValue != null ? cellValue.toFixed(4) : '-' },
      ]
    },
    latencyItems () {
      const d = this.data.latency_diagnostics
      if (!d) return []
      return [
        { key: 'count', label: this.$t('aice.aiproxy.usage.request_count'), value: d.request_count != null ? d.request_count : '-' },
        { key: 'avg', label: this.$t('aice.aiproxy.usage.avg'), value: d.avg_latency_ms != null ? this.formatDuration(d.avg_latency_ms) : '-' },
        { key: 'max', label: this.$t('aice.aiproxy.usage.max_latency'), value: d.max_latency_ms != null ? this.formatDuration(d.max_latency_ms) : '-' },
        { key: 'p50', label: this.$t('aice.aiproxy.usage.p50'), value: d.p50_latency_ms != null ? this.formatDuration(d.p50_latency_ms) : '-' },
        { key: 'p95', label: this.$t('aice.aiproxy.usage.p95'), value: d.p95_latency_ms != null ? this.formatDuration(d.p95_latency_ms) : '-' },
      ]
    },
  },
  watch: {
    data: {
      deep: true,
      handler (val) {
        const raw = (val || {}).model_efficiency || []
        this.page.total = raw.length
        this.page.currentPage = 1
      },
    },
  },
  methods: {
    handlePageChange ({ type, currentPage, pageSize }) {
      if (type === 'current' && currentPage) {
        this.page.currentPage = currentPage
      }
      if (type === 'size' && pageSize) {
        this.page.pageSize = pageSize
        this.page.currentPage = 1
      }
    },
    formatDuration (ms) {
      if (ms == null) return '-'
      if (ms < 1000) return ms.toFixed(0) + 'ms'
      if (ms < 60000) return (ms / 1000).toFixed(2) + 's'
      return (ms / 60000).toFixed(2) + 'min'
    },
  },
}
</script>

<style lang="less" scoped>
.header-with-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  .title-wrapper {
    flex: 1;
    min-width: 0;
  }
}
.metric-select {
  width: 140px;
  flex-shrink: 0;
}
.latency-cards {
  display: flex;
  gap: 12px;
  padding: 12px 0;
}
.latency-card {
  flex: 1;
  min-width: 0;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 12px;
  text-align: center;
  background: #fafafa;
}
.latency-label {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}
.latency-value {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}
.no-data {
  padding: 24px 0;
  text-align: center;
  color: #bfbfbf;
  width: 100%;
}
.composition-chart-wrapper {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}
.table-loading-wrap {
  min-height: 200px;
}
</style>

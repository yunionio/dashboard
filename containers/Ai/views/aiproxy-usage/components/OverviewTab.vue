<template>
  <div>
    <!-- 区块 A：核心指标卡 -->
    <div class="monitor-overview-chart mb-3">
      <div class="header mb-1">
        <div class="title-wrapper">
          <div class="title">{{ $t('aice.aiproxy.usage.aiproxy_usage') }}</div>
        </div>
      </div>
      <stat-cards :loading="loading" :overview-data="data" />
    </div>

    <!-- 区块 B：趋势图 -->
    <trend-charts :loading="loading" :overview-data="data" />

    <!-- 区块 D：服务健康表 -->
    <service-health-table :loading="loading" :overview-data="data" />
  </div>
</template>

<script>
import StatCards from './StatCards'
import TrendCharts from './TrendCharts'
import ServiceHealthTable from './ServiceHealthTable'

export default {
  name: 'AiproxyUsageOverviewTab',
  components: { StatCards, TrendCharts, ServiceHealthTable },
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
  computed: {
    summary () {
      return this.data.summary || {}
    },
  },
}
</script>

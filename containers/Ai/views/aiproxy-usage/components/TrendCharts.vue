<template>
  <a-row :gutter="16">
    <a-col :span="12">
      <div class="monitor-overview-chart">
        <div class="header">
          <div class="title-wrapper">
            <div class="title">{{ $t('aice.aiproxy.usage.chart_request_trend') }}</div>
          </div>
        </div>
        <overview-line
          id="request-trend-chart"
          chartHeigth="300px"
          showLegend
          :exportName="$t('aice.aiproxy.usage.chart_request_trend')"
          :chartData="requestChartData"
          :loading="loading" />
      </div>
    </a-col>
    <a-col :span="12">
      <div class="monitor-overview-chart">
        <div class="header">
          <div class="title-wrapper">
            <div class="title">{{ $t('aice.aiproxy.usage.chart_token_trend') }}</div>
          </div>
        </div>
        <overview-line
          id="token-trend-chart"
          chartHeigth="300px"
          showLegend
          :exportName="$t('aice.aiproxy.usage.chart_token_trend')"
          :chartData="tokenChartData"
          :loading="loading" />
      </div>
    </a-col>
  </a-row>
</template>

<script>
import OverviewLine from '@Monitor/components/MonitorCard/sections/chart/line'
import { seriesToLineChart } from '../utils/transformChart'

export default {
  name: 'AiproxyUsageTrendCharts',
  components: { OverviewLine },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    overviewData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    series () {
      return (this.overviewData || {}).series || []
    },
    requestChartData () {
      return seriesToLineChart(this.series, {
        timeFormat: 'YYYY-MM-DD',
        fields: [
          { key: 'request_count', label: this.$t('aice.aiproxy.usage.request_count_short') },
          { key: 'success_count', label: this.$t('aice.aiproxy.usage.success') },
          { key: 'failure_count', label: this.$t('aice.aiproxy.usage.failed') },
        ],
      })
    },
    tokenChartData () {
      return seriesToLineChart(this.series, {
        timeFormat: 'YYYY-MM-DD',
        fields: [
          { key: 'token_count', label: this.$t('aice.aiproxy.usage.token_count') },
          { key: 'input_tokens', label: this.$t('aice.aiproxy.usage.input_tokens') },
          { key: 'output_tokens', label: this.$t('aice.aiproxy.usage.output_tokens') },
        ],
      })
    },
  },
}
</script>

<style scoped>
.monitor-overview-chart {
  border: 1px solid #e8e8e8;
  padding: 5px;
}
</style>

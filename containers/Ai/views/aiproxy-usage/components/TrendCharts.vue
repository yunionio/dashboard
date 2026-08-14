<template>
  <a-row :gutter="16">
    <a-col :span="12">
      <div class="monitor-overview-chart">
        <div class="header">
          <div class="title-wrapper">
            <div class="title">{{ $t('aice.aiproxy.usage.chart_request_trend') }}</div>
          </div>
        </div>
        <a-spin :spinning="loading">
          <div class="usage-uplot-wrap">
            <div v-if="requestLegend.length" class="usage-uplot-legend">
              <span v-for="item in requestLegend" :key="item.label" class="usage-uplot-legend__item">
                <i class="usage-uplot-legend__dot" :style="{ background: item.stroke }" />
                {{ item.label }}
              </span>
            </div>
            <uchart :data="requestUPlot.data" :options="requestUPlot.options" />
          </div>
        </a-spin>
      </div>
    </a-col>
    <a-col :span="12">
      <div class="monitor-overview-chart">
        <div class="header">
          <div class="title-wrapper">
            <div class="title">{{ $t('aice.aiproxy.usage.chart_token_trend') }}</div>
          </div>
        </div>
        <a-spin :spinning="loading">
          <div class="usage-uplot-wrap">
            <div v-if="tokenLegend.length" class="usage-uplot-legend">
              <span v-for="item in tokenLegend" :key="item.label" class="usage-uplot-legend__item">
                <i class="usage-uplot-legend__dot" :style="{ background: item.stroke }" />
                {{ item.label }}
              </span>
            </div>
            <uchart :data="tokenUPlot.data" :options="tokenUPlot.options" />
          </div>
        </a-spin>
      </div>
    </a-col>
  </a-row>
</template>

<script>
import Uchart from '@/components/Uchart'
import { seriesToUPlotHourly } from '../utils/uplotHourly'

const CHART_COLORS = ['#ADD1F3', '#F3CBAD', '#F3ADB2', '#ADE4B6', '#ADAEF3', '#A593E0']

export default {
  name: 'AiproxyUsageTrendCharts',
  components: { Uchart },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    overviewData: {
      type: Object,
      default: () => ({}),
    },
    filters: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    series () {
      return (this.overviewData || {}).series || []
    },
    requestUPlot () {
      return this.buildUPlot({
        fields: [
          { key: 'request_count', label: this.$t('aice.aiproxy.usage.request_count_short') },
          { key: 'success_count', label: this.$t('aice.aiproxy.usage.success') },
          { key: 'failure_count', label: this.$t('aice.aiproxy.usage.failed') },
        ],
      })
    },
    tokenUPlot () {
      return this.buildUPlot({
        fields: [
          { key: 'token_count', label: this.$t('aice.aiproxy.usage.token_count') },
          { key: 'input_tokens', label: this.$t('aice.aiproxy.usage.input_tokens') },
          { key: 'output_tokens', label: this.$t('aice.aiproxy.usage.output_tokens') },
        ],
      })
    },
    requestLegend () {
      return this.requestUPlot.seriesMeta || []
    },
    tokenLegend () {
      return this.tokenUPlot.seriesMeta || []
    },
  },
  methods: {
    buildUPlot ({ fields }) {
      const { data, seriesMeta } = seriesToUPlotHourly(this.series, {
        fields,
        colors: CHART_COLORS,
        start: this.filters.start,
        end: this.filters.end,
      })
      // 无有效数据点时交给 Uchart 展示「暂无数据」
      if (!this.hasValidSeriesValues(data)) {
        return {
          data: [],
          seriesMeta: [],
          options: this.buildUPlotOptions([]),
        }
      }
      return {
        data,
        seriesMeta,
        options: this.buildUPlotOptions(seriesMeta),
      }
    },
    hasValidSeriesValues (data) {
      if (!data || data.length <= 1) return false
      for (let i = 1; i < data.length; i++) {
        const row = data[i] || []
        for (let j = 0; j < row.length; j++) {
          const val = row[j]
          if (val !== null && val !== undefined && !Number.isNaN(val)) {
            return true
          }
        }
      }
      return false
    },
    buildUPlotOptions (seriesMeta = []) {
      return {
        width: '100%',
        height: 300,
        margin: {
          left: 60,
        },
        scales: {
          x: {
            time: true,
          },
          y: {
            auto: true,
          },
        },
        axes: [
          {
            // 强制横轴刻度为整点小时，避免出现分钟刻度
            incrs: [
              3600,
              3600 * 2,
              3600 * 3,
              3600 * 4,
              3600 * 6,
              3600 * 12,
              3600 * 24,
              3600 * 24 * 2,
              3600 * 24 * 7,
              3600 * 24 * 14,
              3600 * 24 * 30,
            ],
            values: (self, ticks) => {
              return ticks.map(item => {
                const m = this.$moment(item * 1000).startOf('hour')
                return m.format('MM-DD') + '\n' + m.format('HH:00')
              })
            },
          },
          {
            scale: 'y',
            size: 55,
          },
        ],
        // 关闭内置 legend，避免出现 Time: --；改用上方自定义图例
        legend: {
          show: false,
        },
        series: [
          {},
          ...seriesMeta.map(item => ({
            label: item.label,
            width: 1.5,
            stroke: item.stroke,
            // 空缺为 null：横轴保留整点但不打点；有值的点连成折线
            spanGaps: true,
            points: { show: true, size: 3 },
            color: item.stroke,
            unit: '',
          })),
        ],
        tooltip: {
          placement: 'top',
          showTime: false,
          // 空数据不展示系列行；整点全空不展示 tooltip
          hideEmptyValues: true,
          hideWhenAllEmpty: true,
          valueFormatter: (value) => {
            if (value == null || Number.isNaN(value)) return ''
            return Number.isInteger(value) ? String(value) : value.toFixed(2)
          },
        },
      }
    },
  },
}
</script>

<style scoped>
.monitor-overview-chart {
  border: 1px solid #e8e8e8;
  padding: 5px;
}
.usage-uplot-wrap {
  width: 100%;
  min-height: 300px;
}
.usage-uplot-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px 20px;
  padding: 8px 8px 4px;
}
.usage-uplot-legend__item {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  line-height: 22px;
  color: #666;
}
.usage-uplot-legend__dot {
  display: inline-block;
  width: 22px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
  flex-shrink: 0;
}
</style>

<template>
  <div>
    <base-chart chartType="ve-bar"
                :chartData="chartData"
                :chartConfig="chartConfig"
                :chartSettings="chartSettings"
                :chartExtend="chartExtend"
                :loading="loading"
                :chartEvents="chartEvents" />
  </div>
</template>

<script>
import commonChartProps from './common'
import numerify from './formatters'

export default {
  name: 'OverviewHistogram',
  props: commonChartProps(),
  computed: {
    chartExtend () {
      /* 数据展示样式 */
      const commonSeries = {
        barWidth: '12px',
        barMaxWidth: '24px',
        barCategoryGap: '60%',
        label: {
          show: true,
          normal: { position: 'right', show: true, color: '#939EAB', formatter: this.dataFormatter }, // 顶部数值标签显示
          emphasis: { color: '#4DA1FF' },
        },
      }
      return {
        series (v) {
          return v ? v.map(i => ({ ...i, ...commonSeries })) : []
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: { color: 'rgb(77, 161, 255)', opacity: 0.1 },
          },
          formatter: this.tooltipFormatter,
        },
        xAxis: {
          boundaryGap: [0, 0.01],
          splitLine: { show: false },
          axisLabel: { show: false },
          max: function (value) { return value.max * 1.08 }, // 设置X轴的最大刻度,避免 顶部标签被遮挡
        },
        yAxis: {
          nameGap: 30,
          splitLine: { show: false },
          axisLabel: {
            formatter: (value, index) => {
              if (typeof value === 'string' && value.length > 12) {
                return `${value.slice(0, 6)}...${value.slice(value.length - 6)}`
              }
              return value
            },
          },
        },
      }
    },
    chartConfig () {
      const height = this.chartData.rows && this.chartData.rows.length > 0 ? this.chartData.rows.length * 45 + 100 : 200
      return {
        height: `${height}px`,
        width: '95%',
        legend: { show: this.showLegend },
      }
    },
    chartSettings () {
      const cs = {}
      if (this.chartData && this.chartData.columns && this.chartData.columns.length > 0) {
        cs.yAxisType = [this.yAxisFormat]
      }
      return Object.assign(cs, this.chartSetting)
    },
  },
  methods: {
    valueFormatter (value) {
      return numerify(value, this.yAxisFormat)
    },
    dataFormatter (params) {
      return this.valueFormatter(params.value)
    },
    tooltipFormatter (params) {
      if (!params) {
        return ''
      }
      let format = ''
      for (const item of params) {
        format += item.marker + item.name + ': ' + this.valueFormatter(item.value) + '<br />'
      }
      return format
    },
  },
}
</script>

<style lang="less" scoped>
::v-deep {
  .ve-bar {
    max-height: 1400px; // 30条数据的高度，超过30条数据滚动
    overflow: auto;
  }
}
</style>

<template>
  <div>
    <base-chart  chartType="ve-ring"
                :chartData="chartData"
                :chartConfig="chartConfig"
                :chartSettings="chartSettings"
                :loading="loading"
                :chartEvents="chartEvents" />
  </div>
</template>

<script>
import commonChartProps from './common'

export default {
  name: 'OverviewRing',
  props: Object.assign({
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
  }, commonChartProps()),
  computed: {
    chartConfig () {
      const config = {
        height: this.chartHeigth,
        width: '100%',
        radius: ['45%', '85%'],
        legend: {
          show: this.showLegend,
          orient: 'horizontal',
          bottom: '0%',
        },
        title: {
          show: this.title && this.title.length > 0,
          text: this.title,
          subtext: this.subtitle,
          left: 'center',
          top: '55%',
          textStyle: {
            color: '#999999',
            fontSize: 16,
            align: 'center',
          },
          subtextStyle: {
            fontSize: 20,
            color: ['#333'],
            align: 'center',
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          position: {
            _custom: {
              type: 'function',
              display: '<span>ƒ</span> position(point, params, dom, rect, size)',
            },
          },
        },
      }
      return config
    },
    chartSettings () {
      const cs = {}
      if (this.chartData && this.chartData.columns && this.chartData.columns.length > 0) {
        cs.dataType = this.yAxisFormat
        cs.limitShowNum = 9
      }
      return Object.assign(cs, this.chartSetting)
    },
  },
}
</script>

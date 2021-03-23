<template>
  <div>
    <base-chart :chartType="chartType"
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
// eslint-disable-next-line no-unused-vars
import numerify from './formatters'

export default {
  name: 'OverviewLine',
  props: Object.assign({
    isHistogram: {
      type: String,
      default: false,
    },
  }, commonChartProps()),
  computed: {
    chartType () {
      return this.isHistogram ? 've-histogram' : 've-line'
    },
    chartExtend () {
      /* 当属性为对象时，如果在options中对应的属性为对象(eg: tooltip)或包含对象的数组(eg: series)
       * 对应的配置会被合并，否则将直接覆盖对应的配置
       * **/
      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: { color: 'rgb(77, 161, 255)', opacity: 0.1 },
          },
        },
      }
    },
    chartConfig () {
      /*  在这里配置属性，会导致原配置被覆盖，而不是被合并 */
      return {
        height: this.chartHeigth,
        width: '100%',
        legend: { show: this.showLegend },
        toolbox: {
          show: true,
          feature: { magicType: { type: ['line', 'bar'] } },
        },
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
}
</script>

<template>
  <e-chart
    v-if="rows && rows.length"
    :options="chartOptions"
    @chartInstance="v => $emit('chartInstance', v)"
    autoresize />
  <data-empty v-else />
</template>

<script>
import * as R from 'ramda'
import mixin from './mixin'
import { colors } from './constants'

export default {
  name: 'BarChart',
  mixins: [mixin],
  props: {
    columns: {
      type: Array,
      required: true,
      default: () => ([]),
    },
    rows: {
      type: Array,
      required: true,
      default: () => ([]),
    },
    labelMap: {
      type: Object,
      required: true,
    },
    settingOptions: Object,
  },
  computed: {
    chartData () {
      const mapIndexed = R.addIndex(R.map)
      const series = []
      const [x, ...legendData] = this.columns
      mapIndexed((item, index) => {
        series.push(this.genSerie(item, colors[index]))
      }, legendData)
      const xAxisData = []
      R.forEach(row => {
        xAxisData.push(row[x])
        mapIndexed((legend, legendIndex) => {
          series[legendIndex].data.push(row[legend])
          if (row.options) series[legendIndex] = { ...series[legendIndex], ...row.options }
        }, legendData)
      }, this.rows)
      return { series, xAxisData, legendData }
    },
    legendData () {
      const ret = []
      this.chartData.legendData.map(item => {
        ret.push({
          name: this.labelMap[item],
        })
      })
      return ret
    },
    chartOptions () {
      const options = {
        grid: {
          left: 10,
          top: 30,
          right: 10,
          bottom: 0,
          containLabel: true,
        },
        legend: {
          data: this.legendData,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#ddd',
            },
          },
          backgroundColor: 'rgba(255,255,255,1)',
          padding: [5, 10],
          textStyle: {
            color: '#7588E4',
          },
          extraCssText: 'box-shadow: 0 0 5px rgba(0,0,0,0.3)',
        },
        xAxis: {
          type: 'category',
          data: this.chartData.xAxisData,
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#999',
            },
          },
          axisLabel: {
            align: 'center',
            textStyle: {
              fontSize: 12,
            },
          },
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: ['#D4DFF5'],
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 12,
            },
          },
        },
        series: this.chartData.series,
      }
      const ret = this.mergeOptions(options, this.options)
      return ret
    },
  },
  methods: {
    genSerie (name, color) {
      const formatName = this.labelMap[name]
      if (!R.isNil(this.settingOptions) && !R.isEmpty(this.settingOptions) && this.settingOptions[name]) {
        return {
          name: formatName,
          type: 'bar',
          data: [],
          itemStyle: {
            normal: {
              color,
            },
          },
          ...this.settingOptions[name],
        }
      }
      return {
        name: formatName,
        type: 'bar',
        data: [],
        itemStyle: {
          normal: {
            color,
          },
        },
      }
    },
  },
}
</script>

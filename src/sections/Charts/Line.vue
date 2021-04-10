<template>
  <e-chart
    v-if="(rows && rows.length) || (options.dataset && options.dataset.length)"
    :style="chartStyles"
    :options="chartOptions"
    @chartInstance="v => $emit('chartInstance', v)"
    autoresize />
  <a-empty v-else />
</template>

<script>
import * as R from 'ramda'
import mixin from './mixin'
import { colors } from './constants'

export default {
  name: 'LineChart',
  mixins: [mixin],
  props: {
    columns: {
      type: Array,
      default: () => ([]),
    },
    rows: {
      type: Array,
      default: () => ([]),
    },
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
        }, legendData)
      }, this.rows)
      return { series, xAxisData, legendData }
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
          right: 5,
          data: this.chartData.legendData,
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
          splitLine: {
            show: true,
            interval: 'auto',
            lineStyle: {
              color: ['#D4DFF5'],
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: '#999',
            },
          },
          axisLabel: {
            showMaxLabel: false,
            margin: 10,
            align: 'left',
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
            lineStyle: {
              color: '#999',
            },
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
      return {
        name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 6,
        data: [],
        itemStyle: {
          normal: {
            color,
          },
        },
        lineStyle: {
          normal: {
            width: 1,
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, .12)',
            shadowOffsetX: 4,
            shadowOffsetY: 4,
          },
        },
      }
    },
  },
}
</script>

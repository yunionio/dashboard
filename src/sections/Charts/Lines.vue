<template>
  <e-chart
    v-if="(rows && rows.length) || (options.dataset && options.dataset.length)"
    :style="chartStyles"
    :options="chartOptions"
    @chartInstance="v => $emit('chartInstance', v)"
    autoresize />
  <data-empty v-else />
</template>

<script>
import mixin from './mixin'
import { colors } from './constants'

export default {
  name: 'LinesChart',
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
      const series = []
      const legendData = []
      let xAxisData = []
      this.rows.forEach((row, index) => {
        // construct serie
        const serie = this.genSerie(row.name, colors[index], row.yData)
        series.push(serie)
        // construct legendData
        legendData.push(row.name)
        xAxisData = row.xData
      })
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
          position: (point, params, dom, rect, size) => {
            let wrapper = ''
            if (params[0] && params[0].axisValueLabel) {
              wrapper = `<div style="color: #5D6F80;margin-top:10px">${params[0].axisValueLabel}</div>`
            }
            dom.innerHTML = wrapper + dom.innerHTML
          },
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
            show: true,
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
      if (options.legend.data.length > 2) {
        options.legend.type = 'scroll'
        /* options.legend.orient = 'vertical' */
        /* options.legend.right = 0 */
      }
      const ret = this.mergeOptions(options, this.options)
      return ret
    },
  },
  methods: {
    genSerie (name, color, data) {
      return {
        name,
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 6,
        data: data,
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

<template>
  <div>
    <base-chart :chartType="chartType" :chartData="chartData" :chartConfig="chartConfig" :chartSettings="chartSettings" :chartExtend="chartExtend" :loading="loading" :emptyContent="emptyContent" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { numerify } from '@/filters'

export default {
  name: 'OverviewLine',
  props: {
    isHistogram: { // 默认表示 Y 轴是数据轴，竖向
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    chartData: {},
    emptyContent: {},
    chartSettings: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      chartType: this.isHistogram ? 've-histogram' : 've-bar',
    }
  },
  computed: {
    chartExtend () {
      const commonSerie = {
        barMaxWidth: '16px',
        barCategoryGap: '60%',
      }
      if (!this.isHistogram) {
        commonSerie.label = {
          show: !this.isHistogram,
          normal: {
            position: 'right',
            show: true,
            color: '#939EAB',
          },
          emphasis: {
            color: '#4DA1FF',
          },
        }
      }
      return {
        series (v) {
          if (v) return v.map(i => ({ ...i, ...commonSerie }))
          return []
        },
        xAxis: {
          boundaryGap: [0, 0.01],
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            show: this.isHistogram,
          },
        },
        yAxis: {
          nameGap: 30,
          splitLine: {
            show: this.splitLineShow,
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            formatter (value, index) {
              if (value.length > 24) {
                const start12 = value.slice(0, 6)
                const end12 = value.slice(value.length - 6)
                return `${start12}...${end12}`
              }
              return value
            },
          },
        },
        toolbox: {
          showTitle: false,
        },
      }
    },
    chartConfig () {
      const config = {
        // title,
        height: this.height,
        width: '100%',
        legend: {
          show: this.showLegend,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgb(77, 161, 255)',
              opacity: 0.1,
            },
          },
          position: (point, params, dom, rect, size) => {
            const series = params.map(line => `<div style="color: #616161;">${line.marker} <span>${line.seriesName}</span>  <span>${this.currencySign} ${R.is(Number, line.value) ? (this.isFormatNumber ? numerify(line.value, this.numerifyFormat) : line.value) : line.value}</span></div>`).join('')
            const wrapper = `<div class="chart-tooltip-wrapper">
                          <div style="color: #5D6F80;">${params[0].name}</div>
                          <div class="lines-wrapper">${series}</div>
                        </div>`
            dom.style.border = 'none'
            dom.style.backgroundColor = 'transparent'
            dom.innerHTML = wrapper
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          // top: '3%',
          containLabel: true,
        },
      }

      if (this.isHistogram) {
        config.toolbox = {
          show: true,
          feature: {
            magicType: { type: ['line', 'bar'] },
          },
          right: 20,
        }
        config.grid.top = '40px'
      }
      return config
    },
  },
}
</script>

<style scoped>

</style>

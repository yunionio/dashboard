<template>
  <div class="influx-line-wrapper">
    <e-chart :options="optionsC" theme="light" />
  </div>
</template>

<script>
import i18n from '@/locales'

const NO_DATA = {
  title: {
    show: true,
    textStyle: {
      color: 'grey',
      fontSize: 20,
    },
    text: i18n.t('network.text_503'),
    left: 'center',
    top: 'center',
  },
  xAxis: { type: 'category' },
  yAxis: {},
  series: [{
    type: 'line',
  }],
}

const normalizeNum = num => {
  if (!num || typeof num !== 'number') return 0
  return +num.toFixed(2)
}

export default {
  name: 'LbDashboardLine',
  props: {
    options: {
      type: Object,
      required: true,
    },
    timeFormat: {
      type: String,
      default: 'HH:mm:ss',
    },
  },
  computed: {
    optionsC () {
      if (this.options && this.options.columns) {
        let source = [
          this.options.columns,
        ]
        const timeIndex = this.options.columns.findIndex(column => column === 'time')
        let points = this.options.points
        if (timeIndex >= 0) {
          points = points.map(itemArr => {
            return itemArr.map((item, idx) => {
              if (idx === timeIndex) {
                return this.$moment(item).format(this.timeFormat)
              } else {
                return normalizeNum(item)
              }
            })
          })
        } else {
          console.error(this.$t('network.text_506'))
          return NO_DATA
        }
        source = source.concat(points)
        const { unit = '' } = this.options
        const exceptTime = this.options.columns.filter(column => column !== 'time')
        const chartOpt = {
          legend: {
            data: exceptTime,
          },
          dataset: {
            source,
          },
          tooltip: {
            trigger: 'axis',
            position: (point, params, dom, rect, size) => {
              const series = params.map((line, i) => `<div style="color: #616161;">${line.marker} <span>${line.seriesName}</span>:  <span>${line.value[i + 1]} ${unit}</span></div>`).join('')
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
            containLabel: true,
            bottom: '5%',
          },
          xAxis: {
            type: 'category',
          },
          yAxis: {
            axisLabel: {
              formatter: `{value}${unit}`,
            },
          },
          series: exceptTime.map(column => ({
            type: 'line',
            name: column,
            encode: {
              // 将 "time" 列映射到 X 轴。
              x: timeIndex ? 'time' : source[0][0],
              // 将 <column> 列映射到 Y 轴。
              y: column,
            },
          })),
        }
        if (this.options.chart && this.options.chart.grid && this.options.chart.grid.top) {
          chartOpt.grid.top = this.options.chart.grid.top
        }
        return chartOpt
      }
      return NO_DATA
    },
  },
}
</script>

<style lang="less" scoped>
.influx-line-wrapper {
  height: 400px;
}
</style>

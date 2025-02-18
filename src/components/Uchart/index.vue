<template>
  <div ref="chart" class="uplot-chart-wrapper">
    <div class="uplot-chart-tooltip" v-if="tooltipShow" v-html="toolTipHtml" :style="tooltipStyle" />
  </div>
</template>

<script>
import UPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'

export default {
  name: 'Uchart',
  props: {
    data: {
      type: Array,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      toolTipHtml: '',
      tooltipStyle: {
        left: 0,
        top: 0,
      },
      tooltipShow: false,
    }
  },
  watch: {
    data () {
      this.updateChartData(this.data)
    },
    'options.series' () {
      this.updateChartSeries(this.options.series)
    },
  },
  mounted () {
    this.createChart()
    window.addEventListener('resize', this.autoResizeContainer)
  },
  beforeDestroy () {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.autoResizeContainer)
  },
  methods: {
    autoResizeContainer () {
      const container = this.chart.root?.parentNode
      const width = container.clientWidth
      const height = container.clientHeight
      this.chart.setSize({ width, height })
    },
    createChart () {
      const { data, options } = this.$props
      const that = this
      this.chart = new UPlot({
        ...options,
        width: this.$refs.chart.clientWidth,
        cursor: {
          move: function (self, x, y) {
            const index = self.posToIdx(x)
            const data = []
            let time = ''
            that.data.forEach((d, idx) => {
              if (idx !== 0) {
                data.push({
                  label: that.options.series[idx].label,
                  value: d[index],
                  unit: that.options.series[idx].unit,
                })
              } else {
                time = d[index]
              }
            })
            data.sort((a, b) => {
              return b.value - a.value
            })
            let html = '<div style="padding:10px">'
            if (time) {
              html += `<div>${that.$moment(time * 1000).format('YYYY-MM-DD HH:mm')}</div>`
            }
            data.forEach(d => {
              html += `<div style="margin-bottom:5px">${d.label.length > 50 ? d.label.substring(0, 50) + '...' : d.label}: ${(d.value || 0).toFixed(2)}${d.unit || ''}</div>`
            })
            html += '</div>'
            that.toolTipHtml = html
            if (x === -10 && y === -10) {
              that.toolTipHtml = ''
              that.tooltipShow = false
            } else {
              that.tooltipShow = true
            }
            that.tooltipStyle.left = `${x + 80}px`
            that.tooltipStyle.top = `${y + 40}px`
            that.tooltipStyle.boxShadow = '1px 1px 10px rgba(0, 0, 0, 0.2)'
            return [x, y]
          },
        },
      }, data, this.$refs.chart)
    },
    updateChartData (data) {
      if (this.chart) {
        this.chart.destroy()
        this.createChart()
      }
    },
    updateChartSeries (series) {
      if (this.chart) {
        this.chart.destroy()
        this.createChart()
      }
    },
  },
}
</script>

<style scoped>
/* 添加一些样式以确保图表正确显示 */
.uplot-chart-wrapper {
  width: 100%;
  position: relative;
}
.uplot-chart-tooltip {
  min-width: 100px;
  min-height: 100px;
  position: absolute;
  background: white;
  z-index: 1000;
}
</style>

<template>
  <div ref="chart" class="uplot-chart-wrapper">
    <div id="uplot-chart-tooltip" class="uplot-chart-tooltip" v-if="tooltipShow && !isEmptyData" v-html="toolTipHtml" :style="tooltipStyle" />
    <div v-if="isEmptyData" class="empty-tip">
      <div class="empty-info">
        <icon class="empty-icon" type="data-empty" />
        <div class="empty-text">{{ $t('common.notData') }}</div>
      </div>
    </div>
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
    otherCursorMovePoint: {
      type: Array,
      default: () => {
        return [-10, -10]
      },
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
      syncing: false,
      chart: null,
    }
  },
  computed: {
    isEmptyData () {
      return this.data.length === 0
    },
  },
  watch: {
    data () {
      this.updateChartData(this.data)
    },
    'options.series' () {
      this.updateChartSeries(this.options.series)
    },
    otherCursorMovePoint (val) {
      if (this.isEmptyData) return
      if (this.tooltipShow) return
      if (val[0] !== -10 && val[1] !== -10) {
        if (this.syncing) return
        this.syncing = true
        this.chart.setCursor({
          left: val[0],
          top: val[1],
        })
        this.syncing = false
      }
      if (val[0] === -10 && val[1] === -10) {
        if (this.chart && (this.chart.cursor.left !== -10 || this.chart.cursor.top !== -10)) {
          this.chart.setCursor({
            left: val[0],
            top: val[1],
          })
        }
      }
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
            if (options.cursorMove) {
              if (that.syncing) return [x, y]
              that.syncing = true
            }
            const index = self.posToIdx(x)
            const data = []
            let time = ''
            that.data.forEach((d, idx) => {
              if (idx !== 0) {
                data.push({
                  label: that.options.series[idx].label,
                  value: d[index],
                  unit: that.options.series[idx].unit,
                  color: that.options.series[idx].color,
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
            const textList = []
            data.forEach(d => {
              const label = d.label.startsWith('unknown-0-') ? d.label.replace('unknown-0-', '') : d.label
              const valueUnit = that.options?.tooltip?.valueFormatter ? that.options.tooltip.valueFormatter(d.value, d.unit) : `${(d.value || 0).toFixed(2)}${d.unit || ''}`
              html += `<div style="margin-bottom:5px;font-size:14px;line-height:18px"><span style="width:8px;height:8px;background-color:${d.color};border-radius:50%;display:inline-block;margin-right:5px;"></span>${d.label.length > 50 ? label.substring(0, 50) + '...' : label}: ${valueUnit}</div>`
              textList.push(`${label.length > 50 ? label.substring(0, 50) + '...' : label}: ${valueUnit}`)
            })
            html += '</div>'
            that.toolTipHtml = html
            if (x === -10 && y === -10) {
              that.toolTipHtml = ''
              that.tooltipShow = false
            } else {
              that.tooltipShow = true
              that.updateChartTooltipStyle(self, x, y, textList)
            }
            if (options.cursorMove) {
              options.cursorMove(x, y)
              that.syncing = false
            }
            return [x, y]
          },
        },
      }, data, this.$refs.chart)
    },
    updateChartTooltipStyle (cursor, x, y, textList) {
      let width = 100
      textList.forEach(text => {
        width = Math.max(width, this.pxWidth(text, '12px') + 20)
      })
      this.tooltipStyle.boxShadow = '1px 1px 10px rgba(0, 0, 0, 0.2)'
      if (x + 90 + width > cursor.width - 110) {
        this.tooltipStyle.left = `${x - width - 50}px`
      } else {
        this.tooltipStyle.left = `${x + 90}px`
      }
      const dom = document.getElementById('uplot-chart-tooltip')
      if (dom) {
        const rect = dom.getBoundingClientRect()
        const chartRect = this.$refs.chart.getBoundingClientRect()
        if (y + chartRect.y + rect.height > document.body.clientHeight) {
          if (document.body.clientHeight - rect.height < 0) {
            this.tooltipStyle.top = `${0 - chartRect.y}px`
          } else {
            this.tooltipStyle.top = `${0 - (rect.height - (chartRect.height - y) - (document.body.clientHeight - chartRect.bottom)) + y}px`
          }
        } else {
          this.tooltipStyle.top = `${y + 20}px`
        }
      } else {
        this.tooltipStyle.top = `${y + 20}px`
      }
    },
    pxWidth (text, font) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      font && (context.font = font)
      const metrics = context.measureText(text)
      return metrics.width
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
.empty-tip {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1001;
}
.empty-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.empty-icon {
  font-size: 50px;
}
</style>

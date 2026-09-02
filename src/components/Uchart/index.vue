<template>
  <div ref="chart" class="uplot-chart-wrapper">
    <div
      ref="tooltip"
      class="uplot-chart-tooltip"
      :class="{ 'uplot-chart-tooltip--top': tooltipPlacement === 'top' }"
      v-show="tooltipShow && !isEmptyData"
      v-html="toolTipHtml"
      :style="tooltipStyle" />
    <div v-if="isEmptyData" class="empty-tip">
      <data-empty />
    </div>
  </div>
</template>

<script>
import UPlot from 'uplot'
import 'uplot/dist/uPlot.min.css'
import DataEmpty from '@/components/DataEmpty'
import { escapeHTML } from '@/utils/utils'

export default {
  name: 'Uchart',
  components: {
    DataEmpty,
  },
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
    tooltipPlacement () {
      return this.options?.tooltip?.placement || 'follow'
    },
    isEmptyData () {
      if (!this.data || this.data.length === 0) return true
      // 仅有时间轴，或所有系列值均为空
      if (this.data.length <= 1) return true
      for (let i = 1; i < this.data.length; i++) {
        const row = this.data[i]
        if (!Array.isArray(row)) continue
        for (let j = 0; j < row.length; j++) {
          const val = row[j]
          if (val !== null && val !== undefined && !Number.isNaN(val)) {
            return false
          }
        }
      }
      return true
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
      this.chart = null
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.autoResizeContainer)
  },
  methods: {
    autoResizeContainer () {
      if (!this.chart || this.isEmptyData) return
      const container = this.chart.root?.parentNode
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      this.chart.setSize({ width, height })
    },
    createChart () {
      if (this.isEmptyData) {
        if (this.chart) {
          this.chart.destroy()
          this.chart = null
        }
        return
      }
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
            const seriesData = []
            let time = ''
            that.data.forEach((d, idx) => {
              if (idx !== 0) {
                seriesData.push({
                  label: that.options.series[idx].label,
                  value: d[index],
                  unit: that.options.series[idx].unit,
                  color: that.options.series[idx].color,
                })
              } else {
                time = d[index]
              }
            })
            const hideEmptyValues = !!that.options?.tooltip?.hideEmptyValues
            const hideWhenAllEmpty = !!that.options?.tooltip?.hideWhenAllEmpty
            const showTime = that.options?.tooltip?.showTime !== false
            const visibleData = hideEmptyValues
              ? seriesData.filter(d => d.value !== null && d.value !== undefined && !Number.isNaN(d.value))
              : seriesData
            // 全部为空时不展示 tooltip
            if (hideWhenAllEmpty && visibleData.length === 0) {
              that.toolTipHtml = ''
              that.tooltipShow = false
              if (options.cursorMove) {
                options.cursorMove(x, y)
                that.syncing = false
              }
              return [x, y]
            }
            visibleData.sort((a, b) => {
              return (b.value || 0) - (a.value || 0)
            })
            let html = '<div class="uplot-tooltip-inner">'
            if (showTime && time) {
              const timeFormatter = that.options?.tooltip?.timeFormatter
              html += `<div class="uplot-tooltip-time">${timeFormatter ? timeFormatter(time) : that.$moment(time * 1000).format('YYYY-MM-DD HH:mm')}</div>`
            }
            const textList = []
            visibleData.forEach(d => {
              const label = d.label.startsWith('unknown-0-') ? d.label.replace('unknown-0-', '') : d.label
              const shortLabel = d.label.length > 50 ? label.substring(0, 50) + '...' : label
              const valueUnit = that.options?.tooltip?.valueFormatter ? that.options.tooltip.valueFormatter(d.value, d.unit) : `${(d.value || 0).toFixed(2)}${d.unit || ''}`
              html += `<div class="uplot-tooltip-item"><span class="uplot-tooltip-dot" style="background-color:${escapeHTML(d.color)}"></span>${escapeHTML(shortLabel)}: ${escapeHTML(valueUnit)}</div>`
              textList.push(`${shortLabel}: ${valueUnit}`)
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
      let width = 120
      textList.forEach(text => {
        width = Math.max(width, this.pxWidth(text, '12px') + 40)
      })
      const placement = this.tooltipPlacement
      if (placement === 'top') {
        // 固定展示在图表上方居中
        this.tooltipStyle = {
          left: '50%',
          top: '8px',
          transform: 'translateX(-50%)',
          minWidth: `${width}px`,
        }
        return
      }
      const style = {
        transform: '',
        minWidth: `${width}px`,
      }
      if (x + 90 + width > cursor.width - 110) {
        style.left = `${x - width - 50}px`
      } else {
        style.left = `${x + 90}px`
      }
      const dom = this.$refs.tooltip
      if (dom) {
        const rect = dom.getBoundingClientRect()
        const chartRect = this.$refs.chart.getBoundingClientRect()
        if (y + chartRect.y + rect.height > document.body.clientHeight) {
          if (document.body.clientHeight - rect.height < 0) {
            style.top = `${0 - chartRect.y}px`
          } else {
            style.top = `${0 - (rect.height - (chartRect.height - y) - (document.body.clientHeight - chartRect.bottom)) + y}px`
          }
        } else {
          style.top = `${y + 20}px`
        }
      } else {
        style.top = `${y + 20}px`
      }
      this.tooltipStyle = style
    },
    pxWidth (text, font) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      font && (context.font = font)
      const metrics = context.measureText(text)
      return metrics.width
    },
    updateChartData () {
      if (this.chart) {
        this.chart.destroy()
        this.chart = null
      }
      this.createChart()
    },
    updateChartSeries () {
      if (this.chart) {
        this.chart.destroy()
        this.chart = null
      }
      this.createChart()
    },
  },
}
</script>

<style scoped>
.uplot-chart-wrapper {
  width: 100%;
  min-height: 300px;
  position: relative;
}
.uplot-chart-tooltip {
  position: absolute;
  z-index: 1000;
  pointer-events: none;
  background: rgba(50, 50, 50, 0.9);
  color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 0;
  min-height: 0;
}
.uplot-chart-tooltip ::v-deep .uplot-tooltip-inner {
  padding: 10px 14px;
}
.uplot-chart-tooltip ::v-deep .uplot-tooltip-time {
  margin-bottom: 6px;
  font-size: 13px;
  opacity: 0.85;
}
.uplot-chart-tooltip ::v-deep .uplot-tooltip-item {
  margin-bottom: 4px;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
}
.uplot-chart-tooltip ::v-deep .uplot-tooltip-item:last-child {
  margin-bottom: 0;
}
.uplot-chart-tooltip ::v-deep .uplot-tooltip-dot {
  width: 22px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
  margin-right: 6px;
  vertical-align: -1px;
}
.empty-tip {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  min-height: 300px;
  z-index: 1001;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.25);
}
.empty-tip ::v-deep .wrap {
  margin: 0;
  color: rgba(0, 0, 0, 0.25);
}
.empty-tip ::v-deep .data-empty {
  margin-top: 0;
  font-size: 60px;
  color: rgba(0, 0, 0, 0.25);
}
.empty-tip ::v-deep .ant-empty-description {
  color: rgba(0, 0, 0, 0.25);
}
</style>

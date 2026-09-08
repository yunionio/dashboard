<template>
  <div ref="heatmapRoot" class="monitor-heatmap">
    <div v-if="hasData" class="heatmap-legend">
      <span
        v-for="(band, index) in legendBands"
        :key="band.label"
        class="heatmap-legend-item"
        :class="{ 'is-off': !bandSelected[index] }"
        @click="toggleBand(index)">
        <i class="heatmap-legend-color" :style="{ backgroundColor: band.color }" />
        <span>{{ band.label }}</span>
      </span>
    </div>
    <e-chart
      v-if="hasData"
      :options="chartOptions"
      :autoresize="true"
      :ignoreAutoLabelStyle="true"
      :chartStyle="chartStyle"
      :domId="domId" />
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import 'echarts/lib/chart/heatmap'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/grid'
import 'echarts/lib/component/title'
import { addListener, removeListener } from 'resize-detector'
import { getChartTooltipLabel } from '@Monitor/utils'
import EChart from '@/components/EChart'
import { uuid } from '@/utils/utils'

// 无数据占位：隔行不同灰白交错
const EMPTY_CELL = -1
const EMPTY_WHITE = '#ffffff' // 255,255,255
const EMPTY_GRAY = '#f4f6fa' // 244,246,250
const EMPTY_DARK_GRAY = '#f0f1f8' // 240,241,248

/**
 * 图例 5 档；每档渲染时再拆成浅绿/主色两档。
 * 图例点击一档可同时显隐该档两个色（每档独立 series）。
 * 紫色档：>100%
 */
const LEGEND_BANDS = [
  {
    label: '0~25%',
    color: '#22c55e',
    match: (v) => v > 0 && v <= 25,
    getColor: (v) => (v < 12.5 ? '#86efac' : '#22c55e'),
  },
  {
    label: '25~50%',
    color: '#eab308',
    match: (v) => v > 25 && v <= 50,
    getColor: (v) => (v < 37.5 ? '#fde047' : '#eab308'),
  },
  {
    label: '50~75%',
    color: '#f97316',
    match: (v) => v > 50 && v <= 75,
    getColor: (v) => (v < 62.5 ? '#fdba74' : '#f97316'),
  },
  {
    label: '75~100%',
    color: '#ef4444',
    match: (v) => v > 75 && v <= 100,
    getColor: (v) => (v < 87.5 ? '#fca5a5' : '#ef4444'),
  },
  {
    label: '>100%',
    color: '#a855f7',
    match: (v) => v > 100,
    getColor: (v) => (v <= 125 ? '#d8b4fe' : '#a855f7'),
  },
]

function getBandIndex (val) {
  for (let i = 0; i < LEGEND_BANDS.length; i++) {
    if (LEGEND_BANDS[i].match(val)) return i
  }
  return -1
}

/** ECharts 4 无 overflow:truncate；用真实文字宽度判断，超出才加 ... */
let _labelMeasureCtx = null
function truncateAxisLabel (text, maxWidth = 90) {
  const str = String(text || '')
  if (!str) return ''
  if (typeof document === 'undefined') return str
  if (!_labelMeasureCtx) {
    _labelMeasureCtx = document.createElement('canvas').getContext('2d')
  }
  // 与 echarts axisLabel 默认字体接近
  _labelMeasureCtx.font = '12px sans-serif'
  if (_labelMeasureCtx.measureText(str).width <= maxWidth) {
    return str
  }
  const ellipsis = '...'
  const ellipsisWidth = _labelMeasureCtx.measureText(ellipsis).width
  let end = str.length
  while (end > 0) {
    end -= 1
    const next = str.slice(0, end)
    if (_labelMeasureCtx.measureText(next).width + ellipsisWidth <= maxWidth) {
      return `${next}${ellipsis}`
    }
  }
  return ellipsis
}

// 格子宽度小于该值时不展示数值
const CELL_LABEL_MIN_WIDTH = 30
const CELL_MIN_HEIGHT = 20
const GRID_LEFT = 108
const GRID_RIGHT = 24
const GRID_TOP = 40
const GRID_BOTTOM = 48
// 比 grid.left 再留一点边，避免截断后左侧贴边只露出半个字
const Y_LABEL_MAX_WIDTH = GRID_LEFT - 16

export default {
  name: 'MonitorHeatmap',
  components: {
    EChart,
  },
  props: {
    series: {
      type: Array,
      default: () => [],
    },
    groupBy: {
      type: Array,
      default: () => null,
    },
    timeFormatStr: {
      type: String,
      default: 'MM-DD HH:mm',
    },
    yAxisTitle: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      domId: `monitor-heatmap-${uuid(8)}`,
      // 格子够宽时才展示数值；用 data 避免 resize 时反复重建 options
      showCellLabel: false,
      legendBands: LEGEND_BANDS,
      bandSelected: LEGEND_BANDS.map(() => true),
    }
  },
  computed: {
    groupByFields () {
      return (this.groupBy || []).map(item => _.get(item, 'params[0]')).filter(Boolean)
    },
    chartStyle () {
      const rowCount = Math.max(this.yLabels.length, 1)
      // 每格至少 20px 高：行数多时拉高整图，不压缩格子
      const height = Math.max(rowCount * CELL_MIN_HEIGHT + GRID_TOP + GRID_BOTTOM, 180)
      return {
        width: '100%',
        height: `${height}px`,
      }
    },
    seriesRows () {
      const groupByFields = this.groupByFields
      return (this.series || []).map((item, index) => {
        const tags = item.tags || {}
        let name = ''
        // 与表格一致：有 groupBy 时按聚合字段取值展示
        if (groupByFields.length) {
          name = groupByFields.map(field => tags[field] || '-').join(' / ')
        } else {
          const rawName = item.raw_name || ''
          const usableRawName = rawName &&
            rawName !== 'unknown-0-value' &&
            !String(rawName).startsWith('{')
            ? rawName.replace(/^unknown-0-/, '')
            : ''
          name = tags.vm_name || tags.name || tags.host || tags.hostname ||
            usableRawName ||
            getChartTooltipLabel(item) ||
            `series-${index + 1}`
        }
        return {
          name: String(name),
          points: item.points || [],
        }
      })
    },
    timeList () {
      if (!this.seriesRows.length) return []
      const set = new Set()
      this.seriesRows.forEach(row => {
        (row.points || []).forEach(p => {
          if (p && p.length > 1) set.add(p[p.length - 1])
        })
      })
      return Array.from(set).sort((a, b) => a - b)
    },
    yLabels () {
      return this.seriesRows.map(r => r.name)
    },
    xLabels () {
      // category 仍按实际数据点对齐格子；展示文案由 showXLabelMap 控制
      return this.timeList.map(t => {
        const m = this.$moment(t)
        return `${m.format('MM-DD')}\n${m.format('HH:mm')}`
      })
    },
    /**
     * 与上方 uPlot 折线图一致：按时间跨度选整点间隔（1h/2h/...），
     * 只在最接近这些整点的 category 上展示 label。
     */
    showXLabelMap () {
      const times = this.timeList
      const len = times.length
      if (!len) return {}
      if (len === 1) {
        const m = this.$moment(times[0])
        return { 0: `${m.format('MM-DD')}\n${m.format('HH:mm')}` }
      }
      const min = times[0]
      const max = times[len - 1]
      const span = Math.max(max - min, 1)
      // 目标约 10~12 个刻度（与折线图可视宽度下的密度接近）
      const targetCount = 12
      const intervals = [
        5 * 60 * 1000,
        10 * 60 * 1000,
        15 * 60 * 1000,
        30 * 60 * 1000,
        60 * 60 * 1000,
        2 * 60 * 60 * 1000,
        3 * 60 * 60 * 1000,
        4 * 60 * 60 * 1000,
        6 * 60 * 60 * 1000,
        12 * 60 * 60 * 1000,
        24 * 60 * 60 * 1000,
      ]
      let interval = intervals[intervals.length - 1]
      for (let i = 0; i < intervals.length; i++) {
        if (span / intervals[i] <= targetCount) {
          interval = intervals[i]
          break
        }
      }
      // 对齐到整点间隔边界
      const start = Math.ceil(min / interval) * interval
      const niceTicks = []
      for (let t = start; t <= max; t += interval) {
        niceTicks.push(t)
      }
      if (!niceTicks.length) {
        niceTicks.push(min, max)
      }
      const map = {}
      niceTicks.forEach(tick => {
        // 找最接近该整点的数据下标
        let bestIdx = 0
        let bestDiff = Math.abs(times[0] - tick)
        for (let i = 1; i < len; i++) {
          const diff = Math.abs(times[i] - tick)
          if (diff < bestDiff) {
            bestDiff = diff
            bestIdx = i
          }
        }
        // 间隔过大则跳过（避免强行贴到很远的点）
        if (bestDiff > interval / 2) return
        const m = this.$moment(tick)
        map[bestIdx] = `${m.format('MM-DD')}\n${m.format('HH:mm')}`
      })
      return map
    },
    heatData () {
      const timeIndex = {}
      this.timeList.forEach((t, i) => { timeIndex[t] = i })
      const emptyData = []
      const bandData = LEGEND_BANDS.map(() => [])
      const valueKeys = {}
      this.seriesRows.forEach((row, y) => {
        ;(row.points || []).forEach(p => {
          if (!p || p.length < 2) return
          const val = p[0]
          const ts = p[p.length - 1]
          const x = timeIndex[ts]
          if (x === undefined || R.isNil(val)) return
          const num = Number(val)
          if (Number.isNaN(num)) return
          // 格式化为 0.00% 的视为无数据
          if (Number(num.toFixed(2)) === 0) return
          const bandIndex = getBandIndex(num)
          if (bandIndex < 0) return
          valueKeys[`${x}_${y}`] = true
          const band = LEGEND_BANDS[bandIndex]
          bandData[bandIndex].push({
            value: [x, y, num],
            itemStyle: { color: band.getColor(num) },
          })
        })
        this.timeList.forEach((t, x) => {
          if (valueKeys[`${x}_${y}`]) return
          // 隔行配色：偶数行 灰+深灰；奇数行 浅白+灰
          const emptyColor = y % 2 === 0
            ? (x % 2 === 0 ? EMPTY_GRAY : EMPTY_DARK_GRAY)
            : (x % 2 === 0 ? EMPTY_WHITE : EMPTY_GRAY)
          emptyData.push({
            value: [x, y, EMPTY_CELL],
            itemStyle: { color: emptyColor },
          })
        })
      })
      return { emptyData, bandData }
    },
    hasData () {
      return this.timeList.length > 0 && this.yLabels.length > 0
    },
    valueLabelOption () {
      return {
        show: this.showCellLabel,
        formatter: (params) => {
          const raw = params?.data
          const arr = Array.isArray(raw) ? raw : (raw?.value || [])
          const val = arr[2]
          if (R.isNil(val) || val === EMPTY_CELL) return ''
          const num = Number(val)
          if (Number.isNaN(num) || num < 0) return ''
          return num >= 10 ? num.toFixed(0) : num.toFixed(1)
        },
        color: '#999',
        fontSize: 10,
      }
    },
    chartOptions () {
      const showXLabelMap = this.showXLabelMap
      const { emptyData, bandData } = this.heatData
      const valueLabel = this.valueLabelOption
      return {
        title: {
          text: this.yAxisTitle || this.$t('common.name'),
          left: 8,
          top: 4,
          textStyle: {
            color: '#666',
            fontSize: 12,
            fontWeight: 'normal',
          },
        },
        tooltip: {
          position: 'top',
          formatter: (params) => {
            if (!params || !params.data) return ''
            // 无数据 series 已关 tooltip；此处仅处理有数据
            const raw = params.data
            const arr = Array.isArray(raw) ? raw : (raw.value || [])
            const [x, y, val] = arr
            if (val === EMPTY_CELL || R.isNil(val)) return ''
            const resource = this.yLabels[y] || '-'
            const ts = this.timeList[x]
            // 与上方折线图一致：时间单独一行，下一行「资源: 值」
            const time = ts ? this.$moment(ts).format('YYYY-MM-DD HH:mm') : ''
            const num = _.isNumber(val) ? val.toFixed(2) : val
            return `${time}<br/>${resource}: ${num}%`
          },
        },
        legend: { show: false },
        grid: {
          left: GRID_LEFT,
          right: GRID_RIGHT,
          top: GRID_TOP,
          bottom: GRID_BOTTOM,
        },
        xAxis: {
          type: 'category',
          // 全量时间点：每个 category 对应一列格子
          data: this.xLabels,
          splitArea: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            color: '#999',
            rotate: 0,
            lineHeight: 14,
            // 与折线图相同策略：只展示整点抽样 label（格子仍全量）
            interval: (index) => !!showXLabelMap[index],
            formatter: (value, index) => showXLabelMap[index] || value,
          },
        },
        yAxis: {
          type: 'category',
          data: this.yLabels,
          splitArea: { show: false },
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            color: '#666',
            formatter: (value) => truncateAxisLabel(value, Y_LABEL_MAX_WIDTH),
          },
        },
        series: [
          {
            // 无数据层：灰白交错；silent 不响应 hover / tooltip
            type: 'heatmap',
            data: emptyData,
            silent: true,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 0.5,
            },
            label: { show: false },
            emphasis: { itemStyle: { shadowBlur: 0 } },
          },
          // 每档独立 series：图例一档同时控制该档浅/深两个色
          ...LEGEND_BANDS.map((band, index) => ({
            name: band.label,
            type: 'heatmap',
            data: this.bandSelected[index] ? bandData[index] : [],
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 0.5,
            },
            label: valueLabel,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          })),
        ],
      }
    },
  },
  watch: {
    timeList () {
      this.$nextTick(() => this.updateShowCellLabel())
    },
  },
  mounted () {
    this.updateShowCellLabel()
    if (this.$refs.heatmapRoot) {
      this.__resizeHandler = () => {
        this.updateShowCellLabel()
      }
      addListener(this.$refs.heatmapRoot, this.__resizeHandler)
    }
  },
  beforeDestroy () {
    if (this.$refs.heatmapRoot && this.__resizeHandler) {
      removeListener(this.$refs.heatmapRoot, this.__resizeHandler)
    }
  },
  methods: {
    toggleBand (index) {
      this.$set(this.bandSelected, index, !this.bandSelected[index])
    },
    /** 格子宽度 ≥ 30px 时才在格子内展示数值 */
    updateShowCellLabel () {
      const el = this.$refs.heatmapRoot
      const width = el ? (el.clientWidth || 0) : 0
      const cols = this.timeList.length
      const next = !!(cols && width && ((width - GRID_LEFT - GRID_RIGHT) / cols) >= CELL_LABEL_MIN_WIDTH)
      if (next !== this.showCellLabel) {
        this.showCellLabel = next
      }
    },
  },
}
</script>

<style scoped>
.monitor-heatmap {
  position: relative;
}
.heatmap-legend {
  position: absolute;
  right: 8px;
  top: 4px;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  pointer-events: auto;
}
.heatmap-legend-item {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 11px;
  color: #666;
  user-select: none;
  line-height: 1;
  margin-left: 8px;
}
.heatmap-legend-item.is-off {
  opacity: 0.35;
}
.heatmap-legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 4px;
  border-radius: 1px;
  flex-shrink: 0;
}
</style>

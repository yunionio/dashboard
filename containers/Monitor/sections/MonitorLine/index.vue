<template>
  <a-card size="small" class="explorer-monitor-line" :style="monitorLineCardStyle">
    <div slot="title" v-if="title">
      <a-row type="flex">
        <a-col>
          <a class="font-weight-bold h-100 d-block" style="margin-right: 6px;" @click="toggleShowTableLegend">
            <a-icon type="line-chart" style="font-size: 14px;" v-if="showTableLegend" />
            <a-icon type="credit-card" style="font-size: 14px;" v-if="!showTableLegend" />
          </a>
        </a-col>
        <a-col :span="21">
          {{ title }}
        </a-col>
      </a-row>
    </div>
    <div slot="extra" v-if="showTableExport">
      <a-button v-if="showTableExport && curPager.total" type="link" :title="$t('monitor.full_export')" @click="exportTable">
        {{ $t('table.action.export') }}
      </a-button>
      <slot name="extra" />
    </div>
    <loader v-if="loading" :loading="true" />
    <template v-else>
      <div class="d-flex">
        <uchart :data="uChartData" :options="uChartOptions" :otherCursorMovePoint="otherCursorMovePoint" />
        <div v-if="alertHandlerShow && lineChartOptionsC.dataset.length" class="alert-handler-wrapper position-relative">
          <div class="position-absolute clearfix d-flex align-items-center" :style="{ top: `${topStyleRange[1]}px` }">
            <div class="alert-handler-line" />
            <div class="alert-handler"> {{ formatThreshold }}</div>
          </div>
        </div>
      </div>
      <vxe-grid
        v-if="tableData && tableData.length && showTable && showTableLegend"
        max-height="500"
        size="mini"
        border
        row-id="raw_name"
        ref="tableRef"
        highlight-hover-row
        class="mt-3"
        :columns="columns"
        :data="tableData"
        :row-style="getRowStyle"
        resizable
        :sort-config="sortConfig"
        @cell-click="cellClick"
        @sort-change="sortChange" />
      <div class="vxe-grid--pager-wrapper" v-if="showTableLegend">
        <div class="vxe-pager size--mini">
          <div class="vxe-pager--wrapper">
            <span class="vxe-pager--total" v-if="!pager || (pager && pager.total < 11)">{{ total }}</span>
            <vxe-pager
              v-else
              size="mini"
              @page-change="pageChange"
              :page-sizes="getPageSizes"
              :current-page.sync="curPager.page"
              :page-size.sync="curPager.limit"
              :total="curPager.total" />
          </div>
        </div>
      </div>
    </template>
  </a-card>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import XLSX from 'xlsx'
import { metric_zh, tableColumnMaps } from '@Monitor/constants'
import { ColorHash } from '@/utils/colorHash'
import { transformUnit } from '@/utils/utils'
import { getChartTooltipLabel } from '@Monitor/utils'

const MAX_COLUMNS = 10

export default {
  name: 'ExplorerMonitorLine',
  components: {
  },
  props: {
    unit: {
      type: Object,
      default: () => ({}),
    },
    series: {
      type: Array,
      required: true,
    },
    reducedResult: {
      type: Object,
      default: () => ({}),
    },
    reducedResultOrder: {
      type: String,
      default: '',
    },
    pager: {
      type: Object,
      required: false,
    },
    timeFormatStr: {
      type: String,
      default: 'YYYY-MM-DD HH:mm',
    },
    lineChartOptions: {
      type: Object,
      default: () => ({
        legend: {
          show: false,
          selectedMode: 'multiple',
          selected: {},
        },
      }),
    },
    metricInfo: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    description: {
      type: Object,
    },
    threshold: {
    },
    showTableExport: {
      type: Boolean,
      default: false,
    },
    showTableLegend: {
      type: Boolean,
      default: true,
    },
    monitorLineCardStyle: {
      type: Object,
      default: () => ({}),
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
      chartInstanceOption: {
        series: [],
      },
      lineChartOptionsC: {},
      chartInstance: null,
      seriesOldClickName: null,
      highlight: {
        index: null,
        color: '',
      },
      highlights: [],
      colors: [],
      yMax: 0,
      alertHandlerShow: false,
      topStyleRange: [220, 20],
      curPager: Object.assign({}, this.pager || { seriesIndex: 0, total: 0, limit: 10, page: 0 }),
    }
  },
  computed: {
    fixedSeries () {
      if (this.series.length) {
        const cols = this.series[0].columns.filter(col => col !== 'time')
        if (cols.length > 1) {
          const series = []
          cols.forEach((col, idx) => {
            this.series.forEach(item => {
              const seriesItem = {
                columns: [col, 'time'],
                name: col,
                raw_name: col,
                points: item.points.map(point => [point[idx], point[point.length - 1]]),
              }
              series.push(seriesItem)
            })
          })
          return series
        } else {
          return this.series
        }
      }
      return this.series
    },
    groupBy () {
      const groupBy = _.get(this.metricInfo, 'model.group_by')
      if (groupBy && groupBy.length && groupBy[0].type !== 'time' && groupBy[0].type !== 'fill') {
        return groupBy
      }
      return null
    },
    resultReducer () {
      return _.get(this.metricInfo, 'result_reducer')
    },
    isSelectFunction () {
      const select = _.get(this.metricInfo, 'model.select') || []
      let ret = ''
      select.map(item => {
        if (R.is(Array, item)) {
          item.map(l => {
            if (['mean', 'sum', 'max', 'min'].includes(l.type)) {
              ret = l.type
            }
          })
        } else if (R.is(Object, item)) {
          if (['mean', 'sum', 'max', 'min'].includes(item.type)) {
            ret = item.type
          }
        }
      })
      return ret
    },
    showTable () {
      if (!this.groupBy && !this.resultReducer && this.isSelectFunction && this.columns.length < 2) {
        return false
      }
      return true
    },
    tableData () {
      return this.getTableData(this.fixedSeries, this.reducedResult)
    },
    total () {
      const total = this.tableData.length || 0
      return this.$t('monitor_metric_78', [total])
    },
    columns () {
      const that = this
      const columns = [
        {
          field: 'color',
          width: 50,
          slots: {
            default: ({ row, rowIndex }) => {
              if (this.highlights.some(item => item.index === rowIndex)) {
                return [<icon type="checkbox-fill" style={{ fontSize: '20px', color: (that.colors.length && that.colors[rowIndex]) || that.colorHash.hex(`${rowIndex * 1000}`), cursor: 'pointer', transform: 'translateY(3px)' }}></icon>]
              }
              return [<icon type="checkbox-empty" style="font-size:20px;cursor:pointer;transform:translateY(3px)"></icon>]
            },
            header: ({ column }, h) => {
              let type = 'checkbox-empty'
              if (this.isAllSelected) {
                type = 'checkbox-fill'
              } else if (this.highlights.length) {
                type = 'checkbox-some'
              }
              return [
                this.$createElement('icon', {
                  props: {
                    type,
                  },
                  style: {
                    fontSize: '20px',
                    cursor: 'pointer',
                    transform: 'translateY(3px)',
                    color: 'var(--antd-wave-shadow-color)',
                  },
                  on: {
                    click: this.checkAllClick,
                  },
                }),
              ]
            },
          },
        },
      ]
      if (this.tableData && this.tableData.length) {
        R.forEachObjIndexed((value, key) => {
          const isColumn = !R.isNil(this.tableData[0][key])
          if (isColumn) {
            const measurement = _.get(this.metricInfo, 'model.measurement')
            if ((this.description && this.description.metric_res_type === 'guest') || measurement.startsWith('vm_')) {
              if (value.field.startsWith('host')) {
                return
              }
            }
            columns.push({
              ...value,
              formatter: ({ cellValue }) => {
                if (cellValue === 'value') {
                  const display_name = this.description.display_name
                  const metric = this.metricInfo.model.measurement + '_' + this.description.name
                  let label = metric_zh[display_name]
                  if (label) {
                    label += '/' + metric
                  } else {
                    label = metric
                  }
                  return `${this.description.label || label}${this.isSelectFunction ? `(${this.isSelectFunction.toUpperCase()})` : ''}` || cellValue
                }
                return cellValue
              },
              slots: {
                default: ({ row, rowIndex }) => {
                  const cellValue = row[value.field]
                  let val = cellValue
                  if (cellValue === 'value') {
                    const display_name = this.description.display_name
                    const metric = this.metricInfo.model.measurement + '_' + this.description.name
                    let label = metric_zh[display_name]
                    if (label) {
                      label += '/' + metric
                    } else {
                      label = metric
                    }
                    val = `${this.description.label || label}${this.isSelectFunction ? `(${this.isSelectFunction.toUpperCase()})` : ''}` || cellValue
                  }
                  return [<span>{val}</span>]
                },
              },
            })
          }
        }, tableColumnMaps)
      }
      const groupByFields = (this.groupBy || []).map(item => _.get(item, 'params[0]'))
      if (this.groupBy && groupByFields.length) {
        groupByFields.forEach(groupByField => {
          if (!columns.find(val => val.field === groupByField)) {
            const title = this.$te(`dictionary.${groupByField}`) ? this.$t(`dictionary.${groupByField}`) : groupByField
            columns.push({
              field: groupByField,
              title,
              formatter: ({ row }) => row[groupByField] || '-',
              slots: {
                default: ({ row, rowIndex }) => {
                  const val = row[groupByField] || '-'
                  return [<span>{val}</span>]
                },
              },
            })
          }
        })
      }
      if (this.reducedResult && this.reducedResult.reducer) {
        const { reducer = {} } = this.reducedResult
        const title = reducer.type === 'percentile' ? `P${reducer.params && reducer.params[0]}` : reducer.type === 'avg' ? 'MEAN' : reducer.type.toUpperCase()
        columns.push({
          field: 'result',
          title,
          formatter: ({ cellValue }) => {
            const unit = _.get(this.description, 'description.unit') || _.get(this.description, 'unit')
            const val = transformUnit(cellValue, unit)
            return val.text
          },
          slots: {
            default: ({ row, rowIndex }) => {
              const cellValue = row.result
              const unit = _.get(this.description, 'description.unit') || _.get(this.description, 'unit')
              const val = transformUnit(cellValue, unit)
              return [<span>{val.text}</span>]
            },
          },
          sortable: true,
        })
      }
      if (this.tableData && this.tableData.length && this.tableData.some(item => {
        return item.raw_name && item.raw_name.startsWith('{')
      })) {
        columns.push({
          field: 'raw_name',
          title: this.$t('cloudenv.text_237'),
          slots: {
            default: ({ row, rowIndex }) => {
              const val = row.raw_name || ''
              return [<span>{val}</span>]
            },
          },
          formatter: ({ row }) => {
            return row.raw_name || ''
          },
        })
      }
      // 只有raw_name 一列可以展示
      if (columns.length === 1) {
        columns.push({
          field: 'raw_name',
          title: this.$t('monitor.monitor_metric'),
          slots: {
            default: ({ row, rowIndex }) => {
              const val = (row.raw_name || '').replace('unknown-0-', '')
              return [<span>{val}</span>]
            },
          },
          formatter: ({ row }) => {
            return (row.raw_name || '').replace('unknown-0-', '')
          },
        })
      }
      return columns.slice(0, MAX_COLUMNS)
    },
    formatThreshold () {
      if (!this.threshold) return '0'
      const unit = _.get(this.description, 'description.unit') || _.get(this.description, 'unit')
      let formatStr = '0'
      if (unit === '%') { // 比如用户输入 2.22%，这里传入为 '0.00'
        const sLen = this.threshold.length
        const sArr = []
        for (let i = 0; i < sLen; i++) {
          const s = this.threshold[i]
          const v = /\d/.test(s) ? '0' : s
          sArr.push(v)
        }
        formatStr = sArr.join('')
      }
      const ret = transformUnit(this.threshold, unit, 1000, formatStr)
      return `${ret.value}${ret.unit}`
    },
    title () {
      let title = ''
      if (this.fixedSeries.length && this.description) {
        title = this.description.title || ''
        if (this.description.metric_res_type && this.description.metric_res_type === 'host') {
          if (this.$te(`dictionary.${this.description.metric_res_type}`)) {
            const hostPrefix = this.$t(`dictionary.${this.description.metric_res_type}`)
            if (!title.startsWith(hostPrefix)) {
              title = hostPrefix + title
            }
          }
        }
      }
      return title
    },
    sortConfig () {
      if (this.reducedResultOrder && this.columns.some(item => item.field === 'result')) {
        return {
          defaultSort: {
            field: 'result',
            order: this.reducedResultOrder,
          },
        }
      }
      return {}
    },
    getPageSizes () {
      const ret = [10, 20, 50, 100, 200]
      if (this.curPager.Total > ret[ret.length - 1]) {
        ret.push(this.curPager.Total)
      }
      return ret
    },
    isAllSelected () {
      return this.highlights.length === this.tableData.length
    },
    uChartData () {
      const ret = []
      if (this.fixedSeries.length) {
        const time = this.fixedSeries[0].points.map(item => item[item.length - 1])
        ret.push(time.map(item => item / 1000))
        this.fixedSeries.forEach((item, i) => {
          const row = []
          time.forEach(t => {
            const target = item.points.filter(p => p[1] === t)
            if (target.length) {
              row.push(target[0][0])
            } else {
              row.push(null)
            }
          })
          if (this.highlights.some(item => item.index === i)) {
            ret.push(row)
          }
        })
      }
      return ret
    },
    uChartOptions () {
      let unit = _.get(this.description, 'description.unit') || _.get(this.description, 'unit')
      // 检查数据是否为空（只有时间轴，没有数据系列）
      const isEmptyData = !this.uChartData || this.uChartData.length <= 1
      let yTicks
      let finalYMin
      let finalYMax
      if (isEmptyData) {
        // 如果数据为空，不显示刻度线，设置默认范围
        yTicks = []
        finalYMin = 0
        finalYMax = 100
      } else {
        // 检查单位是否为100%且数据都在0-100之间
        const isPercent100 = (unit === '%' || unit === '100%') && this.isDataInRange0To100(this.uChartData)
        if (isPercent100) {
          // 如果单位是100%且数据都在0-100之间，使用固定的刻度线
          yTicks = [0, 20, 40, 60, 80, 100]
          finalYMin = 0
          finalYMax = 100
        } else {
          // 检查数据是否都是整数
          const isInteger = this.isAllIntegers(this.uChartData)
          // 计算 Y 轴范围
          const minRange = isInteger ? 1 : 0.01
          const [yMin, yMax] = this.calculateYAxisRange(this.uChartData, minRange)
          // 生成 Y 轴刻度（会自动在数据范围外增加刻度线）
          yTicks = this.generateYTicks(yMin, yMax, 1, 10, isInteger)
          // 使用刻度线的最小值和最大值作为 Y 轴范围
          finalYMin = yTicks.length > 0 ? yTicks[0] : yMin
          finalYMax = yTicks.length > 0 ? yTicks[yTicks.length - 1] : yMax
        }
      }
      const ret = {
        width: '100%',
        height: 300,
        margin: {
          left: 100,
        },
        scales: {
          x: {
            time: true, // x轴为时间轴
          },
          y: {
            auto: false, // 禁用自动调整
            range: [finalYMin, finalYMax],
          },
        },
        axes: [
          {
            values: (self, ticks, space) => {
              return ticks.map(item => this.$moment(item * 1000).format('MM-DD') + '\n' + this.$moment(item * 1000).format('HH:mm'))
            },
          },
          {
            scale: 'y',
            size: 75,
            splits: (self, scaleMin, scaleMax) => {
              // 使用自定义生成的刻度
              return yTicks
            },
            values: (self, ticks, space) => {
              if (unit === 'NULL' || unit === 'count') {
                unit = ''
              }
              if (unit === 'ms') { // 时间类型的Y坐标，要取整 如 ： 1小时10分钟30秒 -> 1小时
                unit = 'intms'
              }
              const list = ticks.map(item => {
                const val = transformUnit(item, unit, 1000, item < 100 ? '0.00' : '0.0')
                return val.text > 10000000 ? val.text / 10000 + 'w' : val.text
              })
              return list
            },
          },
        ],
        legend: {
          show: false,
        },
        grid: {
          show: false,
        },
        series: [
          {},
        ],
        tooltip: {
          valueFormatter: (value, unit) => {
            if (unit === 'NULL' || unit === 'count') {
              unit = ''
            }
            if (unit === 'ms') { // 时间类型的Y坐标，要取整 如 ： 1小时10分钟30秒 -> 1小时
              unit = 'intms'
            }
            const val = transformUnit(value, unit, 1000, '0.0000')
            return val.text
          },
        },
        cursorMove: (x, y) => {
          this.$emit('cursorMove', [x, y])
        },
      }
      this.fixedSeries.forEach((item, i) => {
        const color = (this.colors && this.colors[i]) || this.colorHash.hex(`${i * 1000}`)
        if (this.highlights.some(item => item.index === i)) {
          const label = getChartTooltipLabel(item)
          ret.series.push({ label, width: 1, stroke: color, spanGaps: true, unit, color, points: { show: true, size: 3 } })
        }
      })
      return ret
    },
  },
  watch: {
    fixedSeries (val, oldV) {
      if (!R.equals(val, oldV)) {
        this.genColors()
        this.getMonitorLine()
      }
    },
    lineChartOptions: {
      deep: true,
      handler (val, oldV) {
        if (!R.equals(val, oldV)) {
          this.getMonitorLine()
        }
      },
    },
    description (val, oldV) {
      if (!R.equals(val, oldV)) {
        this.getMonitorLine()
      }
    },
    threshold () {
      this.showThreshold()
    },
    yMax () {
      this.showThreshold()
    },
    pager (val) {
      this.curPager = Object.assign({}, val || { seriesIndex: 0, total: 0, limit: 10, page: 0 })
    },
    tableData (val) {
      this.highlights = val.map((item, index) => ({ index, color: item.color }))
    },
  },
  created () {
    this.colorHash = new ColorHash({
      hue: [
        { min: 0, max: 360 },
        { min: 0, max: 360 },
        { min: 0, max: 360 },
      ],
    })
    this.getMonitorLine()
  },
  destroyed () {
    this.colorHash = null
  },
  methods: {
    // 检查数据是否都是整数
    isAllIntegers (uChartData) {
      if (!uChartData || uChartData.length <= 1) {
        return false
      }

      for (let i = 1; i < uChartData.length; i++) {
        if (Array.isArray(uChartData[i])) {
          for (let j = 0; j < uChartData[i].length; j++) {
            const val = uChartData[i][j]
            if (val !== null && val !== undefined && !isNaN(val)) {
              // 检查是否为整数
              if (!Number.isInteger(val)) {
                return false
              }
            }
          }
        }
      }
      return true
    },

    // 检查数据是否都在0-100之间
    isDataInRange0To100 (uChartData) {
      if (!uChartData || uChartData.length <= 1) {
        return false
      }

      // 收集所有有效数值（忽略 null）
      const allValues = []
      for (let i = 1; i < uChartData.length; i++) {
        if (Array.isArray(uChartData[i])) {
          uChartData[i].forEach(val => {
            if (val !== null && val !== undefined && !isNaN(val)) {
              allValues.push(val)
            }
          })
        }
      }

      if (allValues.length === 0) {
        return false
      }

      const min = Math.min(...allValues)
      const max = Math.max(...allValues)

      // 检查是否都在0-100之间
      return min >= 0 && max <= 100
    },

    // 计算 Y 轴范围，确保最小范围
    calculateYAxisRange (uChartData, minRange = 0.01) {
      if (!uChartData || uChartData.length <= 1) {
        return [0, 100]
      }

      // 收集所有有效数值（忽略 null）
      const allValues = []
      for (let i = 1; i < uChartData.length; i++) {
        if (Array.isArray(uChartData[i])) {
          uChartData[i].forEach(val => {
            if (val !== null && val !== undefined && !isNaN(val)) {
              allValues.push(val)
            }
          })
        }
      }

      if (allValues.length === 0) {
        return [0, 100]
      }

      let min = Math.min(...allValues)
      let max = Math.max(...allValues)
      const range = max - min

      // 如果数据中没有小于0的值，则最小值从0开始
      if (min >= 0) {
        min = 0
      }

      // 如果范围小于最小范围，使用固定范围
      if (range < minRange) {
        const center = (min + max) / 2
        // 如果最小值是0，确保不会小于0
        if (min === 0) {
          min = 0
          max = Math.max(max, minRange)
        } else {
          min = center - minRange / 2
          max = center + minRange / 2
        }
      } else {
        // 添加 10% 边距
        const padding = range * 0.1
        // 如果最小值是0，确保不会小于0
        if (min === 0) {
          min = 0
        } else {
          min = min - padding
        }
        max = max + padding
      }

      return [min, max]
    },

    // 生成 Y 轴刻度，确保间隔至少为 minStep，并在数据范围外自动增加刻度线，最少5条刻度线
    generateYTicks (min, max, minStep = 0.01, maxTicks = 10, isInteger = false) {
      const range = max - min
      const minTicks = 5 // 最少刻度线数量

      if (range <= 0) {
        // 如果最小值和最大值相同，生成至少5条刻度线
        const step = isInteger ? 1 : minStep
        const ticks = []
        // 如果最小值是0，从0开始生成刻度线
        if (min === 0) {
          for (let i = 0; i < minTicks; i++) {
            ticks.push(isInteger ? i * step : parseFloat((i * step).toFixed(10)))
          }
        } else {
          const center = isInteger ? Math.round(min) : min
          // 在中心上下各生成至少2条刻度线
          for (let i = -2; i <= 2; i++) {
            ticks.push(isInteger ? center + i * step : parseFloat((center + i * step).toFixed(10)))
          }
        }
        return ticks
      }

      // 计算理想步长（基于数据范围，确保至少生成 minTicks 条刻度线）
      let step = range / (minTicks - 1)

      if (isInteger) {
        // 如果数据都是整数，使用整数步长
        // 选择合适的整数步长：1, 2, 5, 10, 20, 50, 100, ...
        const niceSteps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
        step = Math.ceil(step)
        // 找到最接近的合适步长
        for (let i = 0; i < niceSteps.length; i++) {
          if (niceSteps[i] >= step) {
            step = niceSteps[i]
            break
          }
        }
        // 如果步长太大，使用计算出的步长向上取整
        if (step > niceSteps[niceSteps.length - 1]) {
          step = Math.ceil(step)
        }
      } else {
        // 确保步长不小于 minStep
        if (step < minStep) {
          step = minStep
        } else {
          // 将步长调整为 minStep 的倍数（向上取整）
          const multiplier = Math.ceil(step / minStep)
          step = multiplier * minStep
        }
      }

      // 计算起始刻度（向下取整到 step 的倍数，并在最小值之前至少一个步长）
      let startTick = Math.floor(min / step) * step
      // 如果最小值是0，确保起始刻度从0开始
      if (min === 0) {
        startTick = 0
      } else {
        // 确保起始刻度在最小值之前至少一个步长
        while (startTick >= min) {
          startTick -= step
        }
      }

      // 计算结束刻度（向上取整到 step 的倍数，并在最大值之后至少一个步长）
      let endTick = Math.ceil(max / step) * step
      // 确保结束刻度在最大值之后至少一个步长
      while (endTick <= max) {
        endTick += step
      }

      // 生成等间距的刻度数组
      const ticks = []
      let currentTick = startTick

      // 生成从起始到结束的所有刻度（包含边界）
      while (currentTick <= endTick + step * 0.001) {
        if (isInteger) {
          ticks.push(Math.round(currentTick))
        } else {
          ticks.push(parseFloat(currentTick.toFixed(10)))
        }
        currentTick += step
      }

      // 确保至少生成 minTicks 条刻度线
      if (ticks.length < minTicks) {
        // 如果刻度线太少，重新计算步长
        const totalRange = endTick - startTick
        step = totalRange / (minTicks - 1)

        if (isInteger) {
          // 整数步长：选择合适的整数步长
          const niceSteps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
          step = Math.ceil(step)
          for (let i = 0; i < niceSteps.length; i++) {
            if (niceSteps[i] >= step) {
              step = niceSteps[i]
              break
            }
          }
          if (step > niceSteps[niceSteps.length - 1]) {
            step = Math.ceil(step)
          }
        } else {
          // 确保步长是 minStep 的倍数
          const multiplier = Math.ceil(step / minStep)
          step = multiplier * minStep
        }

        // 重新计算起始和结束刻度
        if (min === 0) {
          // 如果最小值是0，从0开始
          startTick = 0
          endTick = step * (minTicks - 1)
        } else {
          const center = (min + max) / 2
          const halfRange = (step * (minTicks - 1)) / 2
          startTick = Math.floor((center - halfRange) / step) * step
          endTick = startTick + step * (minTicks - 1)
        }

        // 重新生成刻度
        ticks.length = 0
        currentTick = startTick
        while (currentTick <= endTick + step * 0.001) {
          if (isInteger) {
            ticks.push(Math.round(currentTick))
          } else {
            ticks.push(parseFloat(currentTick.toFixed(10)))
          }
          currentTick += step
        }
      }

      return ticks
    },
    genColors () {
      this.colors = this.fixedSeries.map((item, i) => {
        return this.colors[i] || this.colorHash.hex(`${i * 1000}`)
      })
    },
    checkAllClick (val) {
      const list = []
      if (this.isAllSelected) {
        this.tableData.map((item, index) => {
          if (this.highlights.some(l => l.index === index)) {
            list.push({ row: item, rowIndex: index })
          }
        })
      } else {
        this.tableData.map((item, index) => {
          if (!this.highlights.some(l => l.index === index)) {
            list.push({ row: item, rowIndex: index })
          }
        })
      }
      this.tableSetHighlights(list)
    },
    getTableData (series, reducedResult) {
      return series.map((val, i) => {
        const ret = { ...val.tags, raw_name: val.raw_name }
        const showMetric = !!this.groupBy
        if (showMetric) {
          ret.__metric = val.name
        }
        const { series, color = [] } = this.chartInstanceOption
        const colors = series.map(val => val.itemStyle.color)
        const c = colors[i] || color[0]
        ret.__color = c
        if (reducedResult && reducedResult.result) {
          ret.result = reducedResult.result[i]
        }
        return ret
      })
    },
    pageChange ({ type, currentPage, pageSize, $event }) {
      this.$emit('pageChange', { seriesIndex: this.curPager.seriesIndex, total: this.curPager.total, limit: pageSize, page: currentPage })
    },
    sortChange ({ order }) {
      this.$emit('reducedResultOrderChange', order)
    },
    cellClick ({ row, rowIndex }) {
      this.tableSetHighlight({ row, rowIndex })
    },
    tableSetHighlight ({ row, rowIndex, click }) {
      let seriesName = _.get(this.chartInstanceOption, `series[${rowIndex}].name`)
      seriesName = seriesName || `series${rowIndex}`
      this.highlightSeries([{ seriesName, row, rowIndex }])
    },
    tableSetHighlights (list) {
      const highlights = list.map(item => {
        const { row, rowIndex } = item
        let seriesName = _.get(this.chartInstanceOption, `series[${rowIndex}].name`)
        seriesName = seriesName || `series${rowIndex}`
        return { seriesName, row, rowIndex }
      })
      this.highlightSeries(highlights)
    },
    setChartInstance (v) {
      this.chartInstanceOption = v.getOption()
      this.chartInstance = v
      this.$emit('chartInstance', v)
      this.chartInstance.on('click', params => {
        this._cancelHighlight()
        this.highlightSeries([{ seriesName: params.seriesName, row: this.tableData[params.seriesIndex], rowIndex: params.seriesIndex }])
      })
      if (this.chartInstance && R.is(Function, this.chartInstance.getModel)) {
        const model = this.chartInstance.getModel()
        if (model && R.is(Function, model.getComponent)) {
          const component = model.getComponent('yAxis')
          const yMax = _.get(component, 'axis.scale._extent[1]')
          this.yMax = yMax
        }
      }
    },
    highlightSeries (list, seriesName, row, rowIndex) {
      let highlights = [...this.highlights]
      list.forEach(item => {
        const { row, rowIndex } = item
        const target = this.highlights.filter(item => item.index === rowIndex)
        if (target.length) {
          highlights = highlights.filter(item => item.index !== rowIndex)
        } else {
          highlights = [...highlights, { index: rowIndex, color: row.__color }]
        }
      })
      this.highlights = highlights
    },
    _cancelHighlight () {
      const selected = {}
      const option = {
        data: this.lineChartOptionsC.series.map(s => { selected[s.name] = true; return s.name }),
        selectedMode: 'multiple',
        show: false,
        selected: selected,
      }
      this.chartInstance.setOption({
        legend: option,
      })
    },
    _setHighlights (seriesNames) {
      const selected = {}
      const option = {
        data: this.lineChartOptionsC.series.map(s => { selected[s.name] = seriesNames.includes(s.name); return s.name }),
        selectedMode: 'multiple',
        selected: selected,
        show: false,
      }
      this.chartInstance.setOption({
        legend: option,
      })
    },
    getMonitorLine () {
      this.highlights = this.fixedSeries.map((item, index) => {
        return {
          index,
        }
      })
    },
    getRowStyle ({ $rowIndex, column, columnIndex, $columnIndex }) {
      if ($rowIndex === this.highlight.index) {
        return {
          color: this.highlight.color,
        }
      }
      return null
    },
    showThreshold () {
      if (this.threshold > this.yMax) {
        this.alertHandlerShow = true
      } else {
        this.alertHandlerShow = false
      }
    },
    exportTable () {
      const { total, limit } = this.curPager
      if (total > limit) {
        // 导出全量
        this.$emit('exportTable', total)
      } else {
        this.exportData(this.tableData)
      }
    },
    exportFullData (series, reducedResult) {
      const tableData = this.getTableData(series, reducedResult)
      this.exportData(tableData)
    },
    exportData (data) {
      const columns = this.columns.filter(item => item.field !== 'color')
      const list = [[...columns.map(item => item.title)]]
      data.forEach(item => {
        const row = []
        columns.forEach(col => {
          row.push(col.formatter ? col.formatter({ row: item, cellValue: item[col.field] }) : item[col.field])
        })
        list.push(row)
      })
      const filename = `${this.title || 'monitor table'}.xlsx`
      const ws_name = 'Sheet1'
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(list)
      XLSX.utils.book_append_sheet(wb, ws, ws_name)
      XLSX.writeFile(wb, filename)
    },
    toggleShowTableLegend () {
      this.showTableLegend = !this.showTableLegend
    },
  },
}
</script>

<style lang="less" scoped>
.explorer-monitor-line {
  ::v-deep .ant-card-body {
    width: 100%;
  }
  .alert-handler-wrapper {
    width: 50px;
    .alert-handler-line {
      background-color: red;
      height: 2px;
      z-index: 0;
      position: relative;
      width: 15px;
    }
    .alert-handler {
      font-size: 12px;
      color: red;
    }
  }
}

</style>

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
        <!-- <line-chart class="flex-grow-1" @chartInstance="setChartInstance" width="100%" height="250px" :options="lineChartOptionsC" /> -->
        <uchart :data="uChartData" :options="uChartOptions" />
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
// import { colors } from '@/sections/Charts/constants'
// import LineChart from '@/sections/Charts/Line'
import { ColorHash } from '@/utils/colorHash'
import { transformUnit } from '@/utils/utils'
import { getChartTooltipLabel } from '@Monitor/utils'
// import { BRAND_MAP } from '@/constants'
// import { currencyUnitMap } from '@/constants/currency'
// import { getChartTooltipPosition } from '@/utils/echart'

const MAX_COLUMNS = 10

export default {
  name: 'ExplorerMonitorLine',
  components: {
    // LineChart,
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
      if (!this.groupBy && !this.resultReducer && this.isSelectFunction) {
        return false
      }
      return true
    },
    tableData () {
      return this.getTableData(this.series, this.reducedResult)
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
                return [<icon type="checkbox-fill" style={{ fontSize: '20px', color: that.colors.length && that.colors[rowIndex], cursor: 'pointer', transform: 'translateY(3px)' }}></icon>]
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
      // if (columns.some(item => item.field.startsWith('host')) && columns.some(item => item.field.startsWith('vm'))) {
      //   columns = columns.filter(item => !item.field.startsWith('host'))
      // }
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
      if (this.series.length && this.description) {
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
      if (this.series.length) {
        const time = this.series[0].points.map(item => item[1])
        ret.push(time.map(item => item / 1000))
        this.series.forEach((item, i) => {
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
            auto: true, // y轴自动调整
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
            values: (self, ticks, space) => {
              if (unit === 'NULL' || unit === 'count') {
                unit = ''
              }
              if (unit === 'ms') { // 时间类型的Y坐标，要取整 如 ： 1小时10分钟30秒 -> 1小时
                unit = 'intms'
              }
              const list = ticks.map(item => {
                const val = transformUnit(item, unit, 1000, item < 1 ? '0.00' : '0.0')
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
            const val = transformUnit(value, unit, 1000, value < 1 ? '0.00' : '0.0')
            return val.text
          },
        },
      }
      this.series.forEach((item, i) => {
        const color = (this.colors && this.colors[i]) || this.colorHash.hex(`${i * 1000}`)
        if (this.highlights.some(item => item.index === i)) {
          const label = getChartTooltipLabel(item)
          ret.series.push({ label, width: 1, stroke: color, unit, color })
        }
      })
      return ret
    },
  },
  watch: {
    series (val, oldV) {
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
    genColors () {
      this.colors = this.series.map((item, i) => {
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
      // if (this.chartInstance) {
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
      // const seriesNames = highlights.map(item => {
      //   let seriesName = _.get(this.chartInstanceOption, `series[${item.index}].name`)
      //   seriesName = seriesName || `series${item.index}`
      //   return seriesName
      // })
      // this._setHighlights(seriesNames)
      // }
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
      this.highlights = this.series.map((item, index) => {
        return {
          index,
        }
      })
      // const lineChartOptions = _.cloneDeep(_.mergeWith(this.lineChartOptions, {
      //   series: [],
      //   grid: {
      //     containLabel: true,
      //   },
      // }))
      // lineChartOptions.grid = {
      //   containLabel: true,
      //   top: 10,
      // }
      // const dataset = []
      // const names = []
      // const currencys = []
      // this.series.forEach((item, i) => {
      //   let name = item.raw_name
      //   if (!name || name.startsWith('unknow')) {
      //     if (this.groupBy && (this.metricInfo?.model?.group_by || []).length > 1 && item.tags) {
      //       name = this.metricInfo?.model?.group_by.map(l => {
      //         let n = item.tags[l.params[0]]
      //         if (BRAND_MAP[n] && BRAND_MAP[n].label) {
      //           n = BRAND_MAP[n].label
      //         }
      //         return n
      //       }).join(', ')
      //     } else {
      //       if (BRAND_MAP[name] && BRAND_MAP[name].label) {
      //         name = BRAND_MAP[name].label
      //       }
      //       if (item.tags && item.tags.path) {
      //         name += ` (path: ${item.tags.path})`
      //       }
      //     }
      //   }
      //   if (item.tags) {
      //     const { currency = 'CNY' } = (item.tags || {})
      //     if (currency && !currencys.includes(currency)) {
      //       currencys.push(currency)
      //     }
      //   }
      //   if (name.length > 50) name = `${name.slice(0, 50)}...`
      //   const seriesItem = {
      //     ...(lineChartOptions.series[i] || {}),
      //     itemStyle: {
      //       normal: {
      //         color: colors[i] || this.colorHash.hex(`${i * 1000}`),
      //       },
      //     },
      //     symbolSize: 1,
      //     type: 'line',
      //     encode: { x: 1, y: 0, tooltip: [0, 1] },
      //     datasetIndex: i,
      //     name,
      //   }
      //   lineChartOptions.series[i] = seriesItem
      //   dataset.push({
      //     dimensions: [{ name: 'value', type: 'ordinal' }, { name: 'time', type: 'time' }],
      //     source: item.points,
      //   })
      //   names.push(name)
      // })
      // lineChartOptions.yAxis = {
      //   minInterval: 1,
      //   axisLabel: {
      //     formatter: (value, index) => {
      //       let unit = _.get(this.description, 'description.unit') || _.get(this.description, 'unit')
      //       if (unit === 'NULL') {
      //         unit = ''
      //       }
      //       if (unit === 'ms') { // 时间类型的Y坐标，要取整 如 ： 1小时10分钟30秒 -> 1小时
      //         unit = 'intms'
      //       }
      //       const val = transformUnit(value, unit, 1000, '0')
      //       if (unit === 'currency') {
      //         let unit = ''
      //         if (currencys.length === 1) {
      //           unit = currencyUnitMap[currencys[0]]?.sign || ''
      //         }
      //         return unit ? `${unit} ${val.value || value}` : val.value || value
      //       }
      //       return val.text
      //     },
      //   },
      // }
      // lineChartOptions.xAxis = { type: 'time' }
      // lineChartOptions.tooltip = {
      //   trigger: 'axis',
      //   position: (point, params, dom, rect, size) => {
      //     const list = [...params].sort((a, b) => b.value[0] - a.value[0])
      //     const series = list.map((line, i) => {
      //       let unit = _.get(this.description, 'description.unit') || _.get(this.description, 'unit')
      //       if (unit === 'NULL') {
      //         unit = ''
      //       }
      //       const val = transformUnit(line.value[0], unit)
      //       let value = _.get(val, 'text') || line.value
      //       if (unit === 'currency') {
      //         let unit = ''
      //         if (currencys.length === 1) {
      //           unit = currencyUnitMap[currencys[0]]?.sign || ''
      //         }
      //         value = unit ? `${unit} ${_.get(val, 'value' || line.value[0])}` : _.get(val, 'value' || line.value[0])
      //       }
      //       const color = i === this.highlight.index ? this.highlight.color : '#616161'
      //       let name = line.seriesName
      //       if (!this.showTable || (this.isSelectFunction && this.resultReducer && !this.groupBy) || name.startsWith('unknow')) {
      //         name = this.isSelectFunction.toUpperCase()
      //       }
      //       return `<div style="color: ${color};" class="d-flex align-items-center"><span>${line.marker}</span> <span class="text-truncate" style="max-width: 500px;">${name || ' '}</span>:&nbsp;<span>${value}</span></div>`
      //     }).join('')
      //     let title = list[0].name
      //     if (!title) {
      //       const time = list[0].value && list[0].value[1]
      //       if (time) {
      //         title = this.$moment(time).format('YYYY-MM-DD HH:mm:ss')
      //       }
      //     }
      //     const wrapper = `<div class="chart-tooltip-wrapper">
      //                   <div style="color: #5D6F80;">${title}</div>
      //                   <div class="lines-wrapper">${series}</div>
      //                 </div>`
      //     dom.style.border = 'none'
      //     dom.style.backgroundColor = 'transparent'
      //     dom.style.padding = '0'
      //     dom.innerHTML = wrapper
      //     const s = { contentSize: [size.contentSize[0], (list.length + 1) * 18], viewSize: size.viewSize }
      //     return getChartTooltipPosition(point, dom, s, false)
      //   },
      // }
      // lineChartOptions.dataset = dataset
      // this.lineChartOptionsC = lineChartOptions
      // this.seriesOldClickName = null
      // this.highlight = { index: null, color: '' }
      // console.log(lineChartOptions, dataset)
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

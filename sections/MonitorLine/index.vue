<template>
  <a-card class="explorer-monitor-line d-flex align-items-center justify-content-center">
    <loader v-if="loading" :loading="true" />
    <template v-else>
      <line-chart :columns="lineChartColumns" :rows="lineChartRows" @chartInstance="setChartInstance" width="100%" height="250px" class="mb-4" :options="lineChartOptionsC" />
      <vxe-grid
        v-if="tableData && tableData.length"
        max-height="200"
        size="mini"
        border
        row-id="vm_id"
        ref="tableRef"
        highlight-hover-row
        highlight-current-row
        @cell-click="cellClick"
        :columns="columns"
        :data="tableData"
        :row-style="getRowStyle" />
      <div class="vxe-grid--pager-wrapper">
        <div class="vxe-pager size--mini">
          <div class="vxe-pager--wrapper">
            <span class="vxe-pager--total">{{ total }}</span>
          </div>
        </div>
      </div>
    </template>
  </a-card>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { colors } from '@/sections/Charts/constants'
import { tableColumnMaps } from '@Monitor/constants'
import LineChart from '@/sections/Charts/Line'
import { ColorHash } from '@/utils/colorHash'
import { transformUnit } from '@/utils/utils'

const MAX_COLUMNS = 6

export default {
  name: 'ExplorerMonitorLine',
  components: {
    LineChart,
  },
  props: {
    series: {
      type: Array,
      required: true,
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
  },
  data () {
    return {
      lineChartColumns: [],
      lineChartRows: [],
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
    }
  },
  computed: {
    groupBy () {
      return _.get(this.metricInfo, 'model.group_by')
    },
    tableData () {
      return this.series.map((val, i) => {
        const ret = { ...val.tags }
        const showMetric = !!this.groupBy
        if (showMetric) {
          ret.__metric = val.name
        }
        const { series, color = [] } = this.chartInstanceOption
        const colors = series.map(val => val.itemStyle.color)
        const c = colors[i] || color[0]
        ret.__color = c
        return ret
      })
    },
    total () {
      const total = this.tableData.length || 0
      return this.$t('monitor_metric_78', [total])
    },
    columns () {
      const columns = [
        {
          field: 'color',
          width: 50,
          slots: {
            default: ({ row, rowIndex }) => {
              return [<div class="mx-auto" style={{ width: '10px', height: '10px', 'border-radius': '50%', background: row.__color }} />]
            },
          },
        },
      ]
      if (this.tableData && this.tableData.length) {
        R.forEachObjIndexed((value, key) => {
          const isColumn = !R.isNil(this.tableData[0][key])
          if (isColumn) {
            columns.push(value)
          }
        }, tableColumnMaps)
      }
      const groupByField = _.get(this.groupBy, '[0].params[0]')
      if (this.groupBy && groupByField) {
        if (!columns.find(val => val.field === groupByField)) {
          const title = this.$te(`dictionary.${groupByField}`) ? this.$t(`dictionary.${groupByField}`) : groupByField
          columns.push({
            field: groupByField,
            title,
            formatter: ({ row }) => row[groupByField] || '-',
          })
        }
      }
      return columns.slice(0, MAX_COLUMNS)
    },
  },
  watch: {
    series (val, oldV) {
      if (!R.equals(val, oldV)) {
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
    cellClick ({ row, rowIndex }) {
      this.tableSetHighlight({ row, rowIndex })
    },
    tableSetHighlight ({ row, rowIndex, click }) {
      let seriesName = _.get(this.chartInstanceOption, `series[${rowIndex}].name`)
      seriesName = seriesName || `series${rowIndex}`
      this.highlightSeries(seriesName, row, rowIndex)
    },
    setChartInstance (v) {
      this.chartInstanceOption = v.getOption()
      this.chartInstance = v
      this.$emit('chartInstance', v)
      this.chartInstance.on('click', params => {
        const seriesName = params.seriesName
        if (seriesName !== this.seriesOldClickName) {
          this.seriesOldClickName = null
        }
        this._cancelHighlight()
        this.highlightSeries(params.seriesName, this.tableData[params.seriesIndex], params.seriesIndex)
      })
    },
    highlightSeries (seriesName, row, rowIndex) {
      if (this.chartInstance) {
        this._cancelHighlight()
        this.$refs.tableRef.clearCurrentRow()
        this.highlight = { index: null, color: '' }
        if (seriesName !== this.seriesOldClickName) {
          this.$refs.tableRef.setCurrentRow(row)
          this._setHighlight(seriesName)
          this.seriesOldClickName = seriesName
          this.highlight = { index: rowIndex, color: row.__color }
        } else {
          this.seriesOldClickName = null
        }
      }
    },
    _cancelHighlight () {
      this._setOptionForOpacity(1) // 需要还原opacity
    },
    _setOptionForOpacity (opacity) {
      this.chartInstance.setOption({
        ...this.chartInstanceOption,
        series: this.chartInstanceOption.series.map(val => {
          return {
            ...val,
            lineStyle: {
              ...val.lineStyle,
              opacity,
            },
          }
        }),
      })
    },
    _setHighlight (seriesName) {
      const _setOption = name => {
        this.chartInstance.setOption({
          series: {
            name,
            symbolSize: 3,
            lineStyle: {
              width: 4,
              shadowBlur: 6,
              opacity: 1,
              shadowOffsetX: 8,
              shadowOffsetY: 8,
            },
          },
        })
      }
      if (seriesName) {
        _setOption(seriesName)
      }
    },
    getMonitorLine () {
      const columns = ['time']
      const rows = []
      const lineChartOptions = _.cloneDeep(_.mergeWith(this.lineChartOptions, { series: [] }))
      this.series.forEach((item, i) => {
        const seriesItem = {
          ...(lineChartOptions.series[i] || {}),
          itemStyle: {
            normal: {
              color: colors[i] || this.colorHash.hex(`${i * 1000}`),
            },
          },
          symbolSize: 2,
        }
        lineChartOptions.series[i] = seriesItem
        let name = item.raw_name
        if (item.tags && item.tags.path) {
          name += ` (path: ${item.tags.path})`
        }
        columns.push(name)
        if (i === 0) { // 证明是第一条线，时间点取第一条时间线里的点，所以要求几条线的时间点是一致的
          item.points.forEach(row => {
            const momentObj = this.$moment(row[1])
            const time = momentObj._isAMomentObject ? momentObj.format(this.timeFormatStr) : row[1]
            rows.push({
              time,
              [name]: row[0] || 0,
            })
          })
        } else {
          item.points.forEach((row, i) => {
            if (rows[i]) {
              rows[i][name] = row[0] || 0
            }
          })
        }
      })
      lineChartOptions.yAxis = {
        axisLabel: {
          formatter: (value, index) => {
            let unit = _.get(this.description, 'description.unit')
            if (unit === 'ms') unit = 'intms' // 时间类型的Y坐标，要取整 如 ： 1小时10分钟30秒 -> 1小时
            const val = transformUnit(value, unit)
            return val.text
          },
        },
      }
      lineChartOptions.tooltip = {
        trigger: 'axis',
        position: (point, params, dom, rect, size) => {
          const series = params.map((line, i) => {
            const val = transformUnit(line.value, _.get(this.description, 'description.unit'))
            const value = _.get(val, 'text') || line.value
            const color = i === this.highlight.index ? this.highlight.color : '#616161'
            return `<div style="color: ${color};" class="d-flex align-items-center"><span>${line.marker}</span> <span class="text-truncate" style="max-width: 500px;">${line.seriesName || ' '}</span>:&nbsp;<span>${value}</span></div>`
          }).join('')
          const wrapper = `<div class="chart-tooltip-wrapper">
                        <div style="color: #5D6F80;">${params[0].name}</div>
                        <div class="lines-wrapper">${series}</div>
                      </div>`
          dom.style.border = 'none'
          dom.style.backgroundColor = 'transparent'
          dom.innerHTML = wrapper
        },
      }
      this.lineChartOptionsC = lineChartOptions
      this.seriesOldClickName = null
      this.highlight = { index: null, color: '' }
      this.lineChartRows = rows
      this.lineChartColumns = columns
    },
    getRowStyle ({ $rowIndex, column, columnIndex, $columnIndex }) {
      if ($rowIndex === this.highlight.index) {
        return {
          color: this.highlight.color,
        }
      }
      return null
    },
  },
}
</script>

<style lang="less" scoped>
.explorer-monitor-line ::v-deep .ant-card-body {
  width: 100%;
}
</style>

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
        @mouseleave.native="tableMouseleave"
        @cell-mouseenter="tableMouseenter"
        @cell-click="cellClick"
        :columns="columns"
        :data="tableData"
        :row-style="getRowStyle" />
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
    columns () {
      const columns = [
        {
          field: 'color',
          width: 50,
          slots: {
            default: ({ row, rowIndex }) => {
              // const { series, color } = this.chartInstanceOption
              // const colors = series.map(val => val.itemStyle.color)
              // const c = colors[rowIndex] || color[0]
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
      return columns
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
    tableMouseleave () {
      this._cancelHighlight()
      this._setHighlight()
    },
    tableMouseenter ({ row, rowIndex }) {
      this.tableSetHighlight({ row, rowIndex, click: false })
    },
    cellClick ({ row, rowIndex }) {
      this.highlight = { index: rowIndex, color: row.__color }
      this.tableSetHighlight({ row, rowIndex, click: true })
    },
    tableSetHighlight ({ row, rowIndex, click }) {
      let seriesName = _.get(this.chartInstanceOption, `series[${rowIndex}].name`)
      seriesName = seriesName || `series${rowIndex}`
      this.highlightSeries(seriesName, click, row)
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
        this.highlightSeries(params.seriesName, true, this.tableData[params.seriesIndex])
      })
    },
    highlightSeries (seriesName, isClick = false, row) {
      if (this.chartInstance) {
        if (isClick) {
          this._cancelHighlight()
          if (seriesName === this.seriesOldClickName) { // 如果上一次高亮是click触发的，那么只能通过click切换或者取消
            this.seriesOldClickName = null
            this.$refs.tableRef.clearCurrentRow()
          } else {
            this.$refs.tableRef.setCurrentRow(row)
            this._setHighlight(seriesName)
            this.seriesOldClickName = seriesName
          }
        } else {
          this._cancelHighlight()
          this._setHighlight(seriesName)
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
              width: 3,
              shadowBlur: 6,
              opacity: 1,
              shadowOffsetX: 8,
              shadowOffsetY: 8,
            },
          },
        })
      }
      if (this.seriesOldClickName || seriesName) {
        this._setOptionForOpacity(0.5) // 先把其他数据线变灰
      }
      if (this.seriesOldClickName) {
        _setOption(this.seriesOldClickName)
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
            rows[i][name] = row[0] || 0
          })
        }
      })
      this.lineChartOptionsC = lineChartOptions
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

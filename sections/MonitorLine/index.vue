<template>
  <a-card :title="description ? description.title : ''" size="small" class="explorer-monitor-line">
    <loader v-if="loading" :loading="true" />
    <template v-else>
      <div class="d-flex">
        <line-chart class="flex-grow-1 mb-4" @chartInstance="setChartInstance" width="100%" height="250px" :options="lineChartOptionsC" />
        <div class="alert-handler-wrapper position-relative">
          <div v-if="alertHandlerShow && lineChartOptionsC.dataset.length" class="position-absolute clearfix d-flex align-items-center" :style="{ top: `${topStyleRange[1]}px` }">
            <div class="alert-handler-line" />
            <div class="alert-handler"> {{ formatThreshold }}</div>
          </div>
        </div>
      </div>
      <vxe-grid
        v-if="tableData && tableData.length"
        max-height="200"
        size="mini"
        border
        row-id="raw_name"
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
import { tableColumnMaps } from '@Monitor/constants'
import { colors } from '@/sections/Charts/constants'
import LineChart from '@/sections/Charts/Line'
import { ColorHash } from '@/utils/colorHash'
import { transformUnit } from '@/utils/utils'
import { BRAND_MAP } from '@/constants'

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
    threshold: {
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
      yMax: 0,
      alertHandlerShow: false,
      topStyleRange: [220, 20],
    }
  },
  computed: {
    groupBy () {
      return _.get(this.metricInfo, 'model.group_by')
    },
    tableData () {
      return this.series.map((val, i) => {
        const ret = { ...val.tags, raw_name: val.raw_name }
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
            if (this.description.metricKeyItem && this.description.metricKeyItem.res_type === 'guest') {
              if (value.field.startsWith('host')) {
                return
              }
            }
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
    formatThreshold () {
      if (!this.threshold) return '0'
      const unit = _.get(this.description, 'description.unit')
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
    threshold () {
      this.showThreshold()
    },
    yMax () {
      this.showThreshold()
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
        this._cancelHighlight()
        this.highlightSeries(params.seriesName, this.tableData[params.seriesIndex], params.seriesIndex)
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
      this.chartInstance.setOption({
        series: {
          name: this.seriesOldClickName,
          lineStyle: {
            type: 'solid',
            width: 2,
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
          },
        },
      })
    },
    _setHighlight (seriesName) {
      if (seriesName) {
        this.chartInstance.setOption({
          series: {
            name: seriesName,
            lineStyle: {
              width: 4,
              shadowBlur: 4,
              opacity: 1,
              shadowOffsetX: 4,
              shadowOffsetY: 4,
            },
          },
        })
      }
    },
    getMonitorLine () {
      const lineChartOptions = _.cloneDeep(_.mergeWith(this.lineChartOptions, {
        series: [],
        grid: {
          containLabel: true,
        },
      }))
      const dataset = []
      const names = []
      this.series.forEach((item, i) => {
        let name = item.raw_name
        if (BRAND_MAP[name] && BRAND_MAP[name].label) {
          name = BRAND_MAP[name].label
        }
        if (item.tags && item.tags.path) {
          name += ` (path: ${item.tags.path})`
        }
        const seriesItem = {
          ...(lineChartOptions.series[i] || {}),
          itemStyle: {
            normal: {
              color: colors[i] || this.colorHash.hex(`${i * 1000}`),
            },
          },
          symbolSize: 1,
          type: 'line',
          encode: { x: 1, y: 0, tooltip: [0, 1] },
          datasetIndex: i,
          name,
        }
        lineChartOptions.series[i] = seriesItem
        dataset.push({
          dimensions: [{ name: 'value', type: 'ordinal' }, { name: 'time', type: 'time' }],
          source: item.points,
        })
        names.push(name)
      })
      lineChartOptions.yAxis = {
        minInterval: 1,
        axisLabel: {
          formatter: (value, index) => {
            let unit = _.get(this.description, 'description.unit')
            if (unit === 'ms') { // 时间类型的Y坐标，要取整 如 ： 1小时10分钟30秒 -> 1小时
              unit = 'intms'
            }
            const val = transformUnit(value, unit, 1000, '0')
            return val.text
          },
        },
      }
      lineChartOptions.xAxis = { type: 'time' }
      lineChartOptions.tooltip = {
        trigger: 'axis',
        position: (point, params, dom, rect, size) => {
          const series = params.map((line, i) => {
            const val = transformUnit(line.value[0], _.get(this.description, 'description.unit'))
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
      lineChartOptions.dataset = dataset
      this.lineChartOptionsC = lineChartOptions
      this.seriesOldClickName = null
      this.highlight = { index: null, color: '' }
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

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
        :columns="columns"
        :data="tableData" />
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
    showMetric: {
      type: Boolean,
      default: false,
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
    }
  },
  computed: {
    tableData () {
      return this.series.map(val => {
        const ret = { ...val.tags }
        if (this.showMetric) {
          ret.__metric = val.name
        }
        return ret
      })
    },
    columns () {
      const columns = [
        {
          field: 'color',
          width: 50,
          slots: {
            default: ({ rowIndex }) => {
              const { series, color } = this.chartInstanceOption
              const colors = series.map(val => val.itemStyle.color)
              const c = colors[rowIndex] || color[0]
              return [<div class="mx-auto" style={{ width: '10px', height: '10px', 'border-radius': '50%', background: c }} />]
            },
          },
        },
      ]
      if (this.tableData && this.tableData.length) {
        R.forEachObjIndexed((value, key) => {
          const column = this.tableData[0][key]
          if (column) {
            columns.push(value)
          }
        }, tableColumnMaps)
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
    setChartInstance (v) {
      this.chartInstanceOption = v.getOption()
      this.$emit('chartInstance', v)
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
  },
}
</script>

<style lang="less" scoped>
.explorer-monitor-line ::v-deep .ant-card-body {
  width: 100%;
}
</style>

<template>
  <a-card class="explorer-monitor-line d-flex align-items-center justify-content-center">
    <line-chart :columns="lineChartColumns" :rows="lineChartRows" @chartInstance="setChartInstance" width="100%" height="250px" class="mb-4" :options="lineChartOptions" />
    <vxe-grid
      v-if="tableData && tableData.length"
      max-height="200"
      size="mini"
      border
      row-id="vm_id"
      :columns="columns"
      :data="tableData" />
  </a-card>
</template>

<script>
import * as R from 'ramda'
import { tableColumnMaps } from '@Monitor/constants'
import LineChart from '@/sections/Charts/Line'

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
      default: () => ({}),
    },
  },
  data () {
    return {
      lineChartColumns: [],
      lineChartRows: [],
      chartInstanceOption: { gradientColor: [] },
    }
  },
  computed: {
    tableData () {
      return this.series.map(val => val.tags)
    },
    columns () {
      const columns = [
        {
          field: 'vm_id',
          slots: {
            default: ({ rowIndex }) => {
              const { series } = this.chartInstanceOption
              const colors = series.map(val => val.itemStyle.color)
              const c = colors[rowIndex]
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
  },
  created () {
    this.getMonitorLine()
  },
  methods: {
    setChartInstance (v) {
      this.chartInstanceOption = v.getOption()
      this.$emit('chartInstance', v)
    },
    getMonitorLine () {
      const columns = ['time']
      const rows = []
      this.series.forEach((item, i) => {
        const name = item.raw_name
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
      this.lineChartRows = rows
      this.lineChartColumns = columns
    },
  },
}
</script>

<style lang="scss" scoped>
.explorer-monitor-line ::v-deep .ant-card-body {
  width: 100%;
}
</style>

<template>
  <div>
    <monitor-header
      :time="time"
      :timeGroup="timeGroup"
      :timeOpts="timeOpts"
      @update:time="updateTime"
      @update:timeGroup="updateTimeGroup"
      @refresh="refresh" />
    <monitor-list
      :single-actions="singleActions"
      :listData="listData"
      :loading="loading"
      class="mt-3" />
  </div>
</template>

<script>
import _ from 'lodash'
import MonitorHeader from './Header'
import MonitorList from './List'
import { numerify } from '@/filters'

export default {
  name: 'Monitor',
  components: {
    MonitorHeader,
    MonitorList,
  },
  props: {
    time: {
      type: String,
      required: true,
    },
    timeGroup: {
      type: String,
      required: true,
    },
    timeOpts: {
      type: Object,
    },
    timeGroupOpts: {
      type: Array,
    },
    singleActions: {
      type: Array,
      default: () => [],
    },
    /* monitorList 示例：
      {
        "title": "CPU使用率",
        "series": [
          {
            "name": "vm_cpu",
            "columns": ["time", "CPU使用率"],
            "values": [[1576475100000, 0.020907], [1576475400000, 0.0209034]]
          }
        ],
        "constants": {
          "name": "cpu",
          "label": "CPU使用率",
          "seleteItem": "usage_active",
          "fromItem": "vm_cpu",
          "unit": "%",
          "transfer": 1
        }
      }
    */
    monitorList: {
      type: Array,
    },
    timeFormat: {
      type: String,
    },
    loading: {
      type: Boolean,
    },
  },
  data () {
    const timeFormatStr = this.timeFormat || 'YYYY-MM-DD HH:mm'
    return {
      timeFormatStr,
    }
  },
  computed: {
    listData () {
      return this.monitorList.map(val => {
        const columns = (val.series && val.series.length) ? val.series[0].columns : []
        const rows = []
        val.series.forEach(item => {
          item.points.forEach(row => {
            const rowsItem = {} // eg: { time: '2019-09-01', cpu_usage: 0.7 }
            columns.forEach((column, i) => {
              if (column === 'time') {
                const momentObj = this.$moment(row[i])
                const time = momentObj._isAMomentObject ? momentObj.format(this.timeFormatStr) : row[0]
                rowsItem.time = time
              } else {
                const format = val.constants.format || '0.00' // 默认是保留小数点后两位
                rowsItem[column] = numerify(row[i], format)
              }
            })
            rows.push(rowsItem)
          })
        })
        const unit = _.get(val.series, '[0].unit') || val.constants.unit || ''
        const columns1 = columns[0] === 'time' ? columns : columns.reverse() // 确保time是第一列
        return {
          title: val.title,
          constants: val.constants,
          lineConfig: val.lineConfig,
          unit,
          chartData: { // 组成 ve-line 的数据
            columns: columns1, // eg: ['time', 'cpu_usage']
            rows, // [{ time: '2019-09-01', cpu_usage: 0.7 }]
          },
        }
      })
    },
  },
  methods: {
    refresh () {
      this.$emit('refresh')
    },
    updateTime (time, timeFormat) {
      this.$emit('update:time', time)
      if (!this.timeFormat) {
        this.timeFormatStr = timeFormat
      }
    },
    updateTimeGroup (timeGroup) {
      this.$emit('update:timeGroup', timeGroup)
    },
  },
}
</script>

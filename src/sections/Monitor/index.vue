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
import { numerify } from '@/filters'
import MonitorHeader from './Header'
import MonitorList from './List'

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

        const getGroupByKey = (tags, groupBy) => {
          const vals = []
          groupBy.forEach((key) => {
            const groupVal = tags[key]
            if (groupVal) {
              vals.push(groupVal)
            }
          })
          return vals.join(' ')
        }

        val.series.forEach(item => {
          const tags = item.tags

          let groupByKey = ''
          if (val.constants.groupBy && val.constants.groupBy.length !== 0) {
            groupByKey = getGroupByKey(tags, val.constants.groupBy)
          }

          const row = {
            name: '',
            xData: [],
            yData: [],
          }
          item.points.forEach(point => {
            columns.forEach((column, i) => {
              if (column === 'time') {
                const momentObj = this.$moment(point[i])
                const time = momentObj._isAMomentObject ? momentObj.format(this.timeFormatStr) : point[0]
                row.xData.push(time)
              } else {
                const format = val.constants.format || '0.00' // 默认是保留小数点后两位
                if (groupByKey.length !== 0) {
                  row.name = groupByKey
                } else {
                  row.name = column
                }
                row.yData.push(numerify(point[i], format))
              }
            })
          })
          rows.push(row)
        })

        const unit = _.get(val.series, '[0].unit') || val.constants.unit || ''
        return {
          title: val.title,
          constants: val.constants,
          lineConfig: val.lineConfig,
          noData: columns.length === 0,
          unit,
          chartData: {
            rows,
          },
        }
      }).filter(val => {
        return !(val.constants.noDataHide && val.noData)
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

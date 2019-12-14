<template>
  <div>
    <monitor-header :time="time" :timeGroup="timeGroup" @update:time="updateTime" @update:timeGroup="updateTimeGroup" />
    <monitor-list :single-actions="singleActions" :listData="listData" :loading="loading" class="mt-3" />
  </div>
</template>

<script>
import _ from 'lodash'
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
      type: Array,
    },
    timeGroupOpts: {
      type: Array,
    },
    singleActions: {
      type: Array,
    },
    monitorList: {
      type: Array,
    },
    timeFormat: {
      type: String,
      // default: 'YYYY-MM-DD HH:mm',
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
        let columns = (val.series && val.series.length) ? val.series[0].columns : []
        const rows = []
        val.series.forEach(item => {
          item.values.forEach(row => {
            const rowsItem = {} // eg: { time: '2019-09-01', cpu_usage: 0.7 }
            columns.forEach((column, i) => {
              if (column === 'time') {
                const momentObj = this.$moment(row[i])
                const time = momentObj._isAMomentObject ? momentObj.format(this.timeFormatStr) : row[0]
                rowsItem['time'] = time
              } else {
                rowsItem[column] = row[i]
              }
            })
            rows.push(rowsItem)
          })
        })
        const unit = _.get(val.series, '[0].unit') || val.constants.unit || ''
        return {
          title: val.title,
          constants: val.constants,
          unit,
          chartData: { // 组成 ve-line 的数据
            columns, // eg: ['time', 'cpu_usage']
            rows,
          },
        }
      })
    },
  },
  methods: {
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

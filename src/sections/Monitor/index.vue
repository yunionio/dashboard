<template>
  <div>
    <monitor-header
      :time="time"
      :timeGroup="timeGroup"
      :timeOpts="timeOpts"
      :groupFunc="groupFunc"
      :customTime="customTime"
      :showGroupFunc="false"
      @update:time="updateTime"
      @update:timeGroup="updateTimeGroup"
      @update:customTime="updateCustomTime"
      @update:groupFunc="updateGroupFunc"
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
    customTime: {
      type: Object,
    },
    groupFunc: {
      type: String,
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

        let newSeries = []
        const { series = [] } = val // series长度取决于metric_query长度
        if (val.constants.as) {
          const asList = val.constants.as.split(',')
          if (asList.length > 0) {
            series.map(serie => {
              const columns = serie.columns || []
              const timeIdx = columns.findIndex(col => col === 'time')
              if (columns.length > 2 && timeIdx >= 0) {
                columns.map((col, idx) => {
                  if (idx !== timeIdx) {
                    const serieItem = {
                      ...serie,
                      columns: [col, columns[timeIdx]],
                      name: col,
                      points: [],
                    }
                    serie.points.map(p => {
                      serieItem.points.push([p[idx], p[timeIdx]])
                    })
                    newSeries.push(serieItem)
                  }
                })
              }
            })
          }
        }
        if (!newSeries.length) {
          newSeries = series
        }
        newSeries.map(serie => {
          let groupByKey = ''
          if (val.constants.groupBy && val.constants.groupBy.length) {
            groupByKey = getGroupByKey(serie.tags, val.constants.groupBy)
          }
          const { points = [] } = serie
          columns.map((column, i) => {
            const row = {
              name: '',
              xData: [],
              yData: [],
            }
            points.map((point, idx) => {
              if (column === 'time') {
                const momentObj = this.$moment(point[i])
                const time = momentObj._isAMomentObject ? momentObj.format(this.timeFormatStr) : point[0]
                row.xData.push(time)
                row.hideLegend = true
              } else {
                const format = val.constants.format || '0.00' // 默认是保留小数点后两位
                if (groupByKey.length !== 0) {
                  row.name = groupByKey
                } else {
                  if (val.constants.groupBy && val.constants.groupBy.length !== 0) {
                    row.name = serie.raw_name || serie.name || ''
                  } else {
                    row.name = column
                  }
                }
                row.yData.push(numerify(point[i], format))
              }
            })
            rows.push(row)
          })
        })

        const unit = _.get(val.series, '[0].unit') || val.constants.unit || ''

        // 数据 配置
        const lineConfig = val.lineConfig || {}
        const newLineConfig = {
          xAxis: {
            type: 'category',
            data: [],
          },
          yAxis: {
            type: 'value',
          },
          series: [],
          legend: {
            data: [],
            formatter: (val) => {
              return val
            },
          },
        }
        const format = val.constants.format || '0.00' // 默认是保留小数点后两位
        newSeries.map(item => {
          const { points = [] } = item
          if (points.length) {
            let groupByKey = ''
            if (val.constants.groupBy && val.constants.groupBy.length) {
              groupByKey = getGroupByKey(item.tags, val.constants.groupBy)
            }
            let name = item.name
            if (groupByKey) {
              name = groupByKey
              if (val.constants.as) {
                name = `${groupByKey}(${item.name})`
              }
            }
            const seriesItem = { type: 'line', name, data: [] }
            points.map(point => {
              const momentObj = this.$moment(point[1])
              const time = momentObj._isAMomentObject ? momentObj.format(this.timeFormatStr) : point[1]
              newLineConfig.xAxis.data.push(time)
              seriesItem.data.push(numerify(point[0], format))
            })
            newLineConfig.series.push(seriesItem)
            newLineConfig.legend.data.push(name)
          }
        })
        return {
          title: val.title,
          constants: val.constants,
          lineConfig: Object.assign(newLineConfig, lineConfig),
          noData: columns.length === 0,
          unit,
          chartData: {
            rows,
            columns,
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
    updateCustomTime (customTime) {
      this.$emit('update:customTime', customTime)
    },
    updateGroupFunc (groupBy) {
      this.$emit('update:groupFunc', groupBy)
    },
  },
}
</script>

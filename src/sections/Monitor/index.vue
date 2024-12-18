<template>
  <div>
    <monitor-header
      :time="time"
      :timeGroup="timeGroup"
      :timeOpts="timeOpts"
      :groupFunc="groupFunc"
      :customTime="customTime"
      :showGroupFunc="true"
      customTimeUseTimeStamp
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
import * as R from 'ramda'
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
      listData: [],
      currentTime: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
    }
  },
  computed: {
    startEndTime () {
      let start = ''
      let end = ''
      if (this.time === 'custom') {
        if (this.customTime.to === 'now') {
          end = this.$moment(this.currentTime).format('YYYY-MM-DD HH:mm:ss')
        }
        if (/^now-\d{1,}h/.test(this.customTime.from)) {
          const hs = Number(this.customTime.from.replace('now-', '').replace('h'))
          start = this.$moment(this.currentTime).subtract(hs, 'hours').format('YYYY-MM-DD HH:mm:ss')
        }
      } else {
        if (/^\d{1,}h/.test(this.time)) {
          const hs = Number(this.time.replace('h', ''))
          start = this.$moment(this.currentTime).subtract(hs, 'hours').format('YYYY-MM-DD HH:mm:ss')
          end = this.$moment(this.currentTime).format('YYYY-MM-DD HH:mm:ss')
        }
      }
      return { start, end }
    },
    timeGroupTime () {
      if (/^(\d{1,})m/.test(this.timeGroup)) {
        return Number(this.timeGroup.replace('m', '')) * 60 * 1000
      } else if (/^(\d{1,})h/.test(this.timeGroup)) {
        return Number(this.timeGroup.replace('h', '')) * 60 * 60 * 1000
      }
      return 1000
    },
  },
  watch: {
    monitorList (monitorList) {
      this.listData = monitorList.map(val => {
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
                if (serie.raw_name) {
                  if (serie.raw_name.indexOf('unknown') >= 0 && serie.tags && serie.tags.length > 0) {
                    const tagNames = []
                    for (const k in serie.tags) {
                      tagNames.push(k + '=' + serie.tags[k])
                    }
                    row.name = tagNames.join(',')
                  } else {
                    row.name = serie.raw_name
                  }
                } else if (groupByKey.length !== 0) {
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
        // 判断是否为时间线
        const isTimeLine = columns[1] && columns[1] === 'time' && this.startEndTime.start && this.startEndTime.end && this.timeGroupTime
        // 数据 配置
        const lineConfig = val.lineConfig || {}

        const xAxisConfig = isTimeLine ? {
          min: this.startEndTime.start,
          max: this.startEndTime.end,
          axisLabel: {
            showMinLabel: true,
            showMaxLabel: true,
          },
        } : {}

        const newLineConfig = {
          xAxis: {
            type: isTimeLine ? 'time' : 'category',
            data: [],
            ...xAxisConfig,
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
          tooltip: {
            trigger: 'axis',
            position: (point, params, dom, rect, size) => {
              dom.style.border = 'none'
              dom.style.backgroundColor = 'transparent'
              dom.style.padding = '0'
              let title = params[0] ? params[0].axisValueLabel || params[0].axisValue : ''
              const series = params.map(line => {
                let value = line.value
                if (R.is(Array, value)) {
                  value = line.value[1] === undefined ? '-' : line.value[1]
                  title = line.value[0]
                }
                return `<div style="color: #616161;">
                    ${line.marker}
                    <span>${line.seriesName}</span>:
                    <span>${value}${unit}</span>
                  </div>`
              }).join('')
              const wrapper = `<div class="chart-tooltip-wrapper">
                <div style="color: #5D6F80;">${title}</div>
                <div class="lines-wrapper">${series}</div>
              </div>`
              dom.innerHTML = wrapper
            },
          },
        }
        const format = val.constants.format || '0.00' // 默认是保留小数点后两位
        newSeries.map((item, index) => {
          const { points = [] } = item
          let newPoints = []
          if (isTimeLine) {
            points.forEach((item, index) => {
              newPoints.push(item)
              // 补充缺失的时间点
              if (points[index + 1] && points[index + 1][1] && points[index + 1][1] - item[1] > this.timeGroupTime) {
                newPoints.push([null, item[1] + 1000])
              }
            })
          } else {
            newPoints = points
          }
          if (newPoints.length) {
            let groupByKey = ''
            if (val.constants.groupBy && val.constants.groupBy.length) {
              groupByKey = getGroupByKey(item.tags, val.constants.groupBy)
            }
            // console.log('item', item)
            let name = item.name
            if (item.raw_name) {
              if (item.raw_name.indexOf('unknown-0-') >= 0) {
                if (item.tags) {
                  const tagName = []
                  for (const k in item.tags) {
                    tagName.push(k + '=' + item.tags[k])
                  }
                  name = tagName.join(',')
                } else if (item.raw_name.indexOf(',') >= 0) {
                  name = item.name
                } else {
                  name = item.raw_name.replace('unknown-0-', '')
                }
              } else {
                name = item.raw_name
              }
            } else if (groupByKey) {
              name = groupByKey
              if (val.constants.as) {
                name = `${groupByKey}(${item.name})`
              }
            }
            const seriesItem = { type: 'line', name, data: [], showSymbol: false }
            newPoints.map(point => {
              const momentObj = this.$moment(point[1])
              const time = momentObj._isAMomentObject ? momentObj.format(this.timeFormatStr) : point[1]
              if (isTimeLine && momentObj._isAMomentObject) {
                if (point[0] === null) {
                  seriesItem.data.push([momentObj.format('YYYY-MM-DD HH:mm:ss')])
                } else {
                  seriesItem.data.push([momentObj.format('YYYY-MM-DD HH:mm:ss'), point[0] === null ? null : parseFloat(numerify(point[0]), format)])
                }
              } else {
                if (index === 0) {
                  newLineConfig.xAxis.data.push(time)
                }
                seriesItem.data.push(parseFloat(numerify(point[0]), format))
              }
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
      this.updateCurrentTime()
      this.$emit('refresh')
    },
    updateTime (time, timeFormat) {
      this.updateCurrentTime()
      this.$emit('update:time', time)
      if (!this.timeFormat) {
        this.timeFormatStr = timeFormat
      }
    },
    updateTimeGroup (timeGroup) {
      this.updateCurrentTime()
      this.$emit('update:timeGroup', timeGroup)
    },
    updateCustomTime (customTime) {
      this.updateCurrentTime()
      this.$emit('update:customTime', customTime)
    },
    updateGroupFunc (groupBy) {
      this.$emit('update:groupFunc', groupBy)
    },
    updateCurrentTime () {
      this.currentTime = this.$moment().format('YYYY-MM-DD HH:mm:ss')
    },
  },
}
</script>

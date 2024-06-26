<template>
  <monitor
    :time.sync="time"
    :timeGroup.sync="timeGroup"
    :customTime.sync="customTime"
    :groupFunc.sync="groupFunc"
    :monitorList="monitorList"
    :singleActions="singleActions"
    :loading="loading"
    @refresh="fetchData" />
</template>

<script>
import _ from 'lodash'
import { UNITS, autoComputeUnit, getRequestT } from '@/utils/utils'
import Monitor from '@/sections/Monitor'
import WindowsMixin from '@/mixins/windows'
import { getSignature } from '@/utils/crypto'
import { STORAGE_MONITOR_OPTS } from '../constants'
import MonitorTimeMixin from '@/mixins/monitorTime'

export default {
  name: 'StorageMonitorSidepage',
  components: {
    Monitor,
  },
  mixins: [WindowsMixin, MonitorTimeMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      singleActions: [
      ],
      loading: false,
      time: '168h',
      timeGroup: '30m',
      customTime: null,
      groupFunc: 'mean',
      monitorList: [],
    }
  },
  computed: {
    monitorConstants () {
      return STORAGE_MONITOR_OPTS
    },
    wireId () {
      return this.data.id
    },
  },
  created () {
    this.fetchData()
    this.fetchDataDebounce = _.debounce(this.fetchData, 500)
    this.baywatch(['time', 'timeGroup', 'data.id', 'customTime', 'groupFunc'], this.fetchDataDebounce)
  },
  methods: {
    async fetchData () {
      this.loading = true
      const resList = []
      for (let idx = 0; idx < this.monitorConstants.length; idx++) {
        const val = { ...this.monitorConstants[idx], groupFunc: this.groupFunc }
        try {
          const { data } = await new this.$Manager('unifiedmonitors', 'v1')
            .performAction({
              id: 'query',
              action: '',
              data: this.genQueryData(val),
              params: { $t: getRequestT() },
            })
          resList.push({ title: val.label, constants: val, series: data.series })
          if (idx === this.monitorConstants.length - 1) {
            this.loading = false
            this.getMonitorList(resList)
          }
        } catch (error) {
          this.loading = false
          throw error
        }
      }
      this.saveMonitorConfig()
    },
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    getMonitorList (resList) {
      const lineConfig = {
        tooltip: {
          confine: true,
        },
        grid: {
          top: '20%',
        },
      }
      this.monitorList = resList.map(result => {
        const { unit, transfer, seleteItem } = result.constants
        const isSizestrUnit = UNITS.includes(unit)
        let series = result.series
        if (!series) series = []
        if (isSizestrUnit || unit === 'bps') {
          series = series.map(serie => {
            return autoComputeUnit(serie, unit, transfer, seleteItem)
          })
        }
        return {
          title: result.title,
          series,
          constants: result.constants,
          lineConfig,
        }
      })
    },
    genQueryData (val) {
      const opt = val
      let select = []
      if (val.as) {
        const asItems = val.as.split(',')
        select = val.seleteItem.split(',').map((val, i) => {
          return [
            {
              type: 'field',
              params: [val],
            },
            { // 对应 mean(val.seleteItem)
              type: opt.groupFunc || 'mean',
              params: [],
            },
            { // 确保后端返回columns有 val.label 的别名
              type: 'alias',
              params: [asItems[i]],
            },
          ]
        })
      } else {
        select = val.seleteItem.split(',').map((val, i) => {
          return [
            {
              type: 'field',
              params: [val],
            },
            { // 对应 mean(val.seleteItem)
              type: opt.groupFunc || 'mean',
              params: [],
            },
            { // 确保后端返回columns有 val.label 的别名
              type: 'alias',
              params: [val],
            },
          ]
        })
      }
      const data = {
        metric_query: [
          {
            model: {
              measurement: val.fromItem,
              select,
              group_by: [
                { type: 'tag', params: ['id'] },
              ],
              tags: [
                {
                  key: 'id',
                  value: this.wireId,
                  operator: '=',
                },
              ],
            },
          },
        ],
        scope: this.$store.getters.scope,
        from: this.time,
        interval: this.timeGroup,
        unit: true,
      }
      if (this.time === 'custom' && this.customTime && this.customTime.from && this.customTime.to) {
        data.from = this.customTime.from
        data.to = this.customTime.to
      }
      data.signature = getSignature(data)
      return data
    },
  },
}
</script>

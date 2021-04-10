<template>
  <div>
    <div class="detail-title">{{$t('network.text_487')}}</div>
    <monitor-control v-model="form" @refresh="fetchData" />
    <div class="mt-5">
      <a-row :gutter="8">
        <a-col :span="12">
          <div class="title mt-2">{{$t('network.text_488', [bpsUnit])}}</div>
          <influx-line :options="netOpt" :time-format="timeFormat" />
        </a-col>
        <a-col :span="12">
          <div class="title mt-3">{{$t('network.text_489')}}</div>
          <influx-line :options="connectOpt" :time-format="timeFormat" />
        </a-col>
      </a-row>
      <a-row :gutter="8">
        <a-col :span="12">
          <div class="title mt-3">{{$t('network.text_490')}}</div>
          <influx-line :options="negativeOpt" :time-format="timeFormat" />
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script>

import MonitorControl from './MonitorControl'
import { HAD_DASHBOARD_DATA } from './constants'
import InfluxLine from './components/Line'
import { lbQuery } from './utils'
import { sizestr, UNITS, getRequestT } from '@/utils/utils'

export default {
  name: 'LblistenerDashboardMonitor',
  components: {
    MonitorControl,
    InfluxLine,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      netOpt: {},
      connectOpt: {},
      negativeOpt: {},
      bpsUnit: 'B',
      form: {
        time: {
          from: 'now-1h',
        }, // 1个月
        aggregate: 'mean',
      },
    }
  },
  computed: {
    listenerType () {
      return this.data.listener_type.toLowerCase()
    },
    hasDashboard () {
      return HAD_DASHBOARD_DATA.includes(this.data.listener_type)
    },
    timeFormat () {
      const from = this.form.time.from.replace(/\D+/g, '')
      const to = this.form.time.to ? this.form.time.to.replace(/\D+/g, '') : 0
      const timeRange = (from - to) * 3600 // 小时 -> 秒
      if (timeRange <= 3600 * 24) { // 小于1天
        return 'HH:mm:ss'
      } else if (timeRange >= (3600 * 24) && timeRange <= (3600 * 24 * 30)) { // 大于1天，小于30天
        return 'MM-DD HH:mm:ss'
      } else if (timeRange >= (3600 * 24 * 30) && timeRange <= (3600 * 24 * 30 * 12)) { // 大于1月，小于1年
        return 'MM-DD HH:mm:ss'
      } else { // 大于1年
        return 'YYYY-MM-DD HH:mm:ss'
      }
    },
  },
  watch: {
    form: {
      deep: true,
      handler () {
        this.fetchData()
      },
    },
    'data.id' (key) {
      this.fetchData()
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.getData('bps', this.form.time, this.form.aggregate)
      this.getData('rate', this.form.time, this.form.aggregate)
      this.getData('accident', this.form.time, this.form.aggregate)
    },
    async getData (fieldType, time, aggregate) {
      const isRule = this.data.type === 2
      const p = {
        fieldType,
        lsType: this.listenerType,
        lsId: this.data.id,
        time,
        aggregate,
        isRule,
        scope: this.$store.getters.scope,
      }
      const { data } = await new this.$Manager('unifiedmonitors', 'v1')
        .performAction({
          id: 'query',
          action: '',
          data: lbQuery(p),
          params: { $t: getRequestT() },
        })
      this._getResultData(data, fieldType)
    },
    _getResultData ({ series }, fieldType) {
      switch (fieldType) {
        case 'bps':
          this.netOpt = this._getSeries(series, true)
          // eslint-disable-next-line no-case-declarations
          const { unit } = this.netOpt
          this.bpsUnit = unit
          break
        case 'rate':
          this.connectOpt = this._getSeries(series)
          break
        case 'accident':
          // eslint-disable-next-line no-case-declarations
          const obj = {
            chart: {
              grid: {
                top: '25%',
              },
            },
          }
          this.negativeOpt = { ...this._getSeries(series), ...obj }
          break
      }
    },
    _getSeries (S, needCompute) {
      if (S && S[0]) {
        let series = S[0]
        if (needCompute) series = this.__autoCompute(series)
        return series
      }
      return {}
    },
    __autoCompute (series) {
      let { points } = series
      let unit = 'B'
      const deleteTimeValues = points.map(arr => arr.slice(0, arr.length - 1))
      let valueArr = deleteTimeValues.reduce((a, b) => a.concat(b))
      valueArr = valueArr.filter(val => val) // 过滤掉 0
      const maxValue = Math.max.apply(null, valueArr)
      if (maxValue >= 1024 && valueArr && valueArr.length > 0) {
        const maxValueStr = sizestr(maxValue, 'B', 1024)
        unit = maxValueStr.slice(-1) // 'B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'
        let scaleIndex = UNITS.findIndex(val => val === unit)
        scaleIndex = scaleIndex || UNITS[UNITS.length - 1]
        scaleIndex = scaleIndex < 0 ? 0 : scaleIndex
        const scale = Math.pow(1024, scaleIndex)
        points = points.map(arr => {
          return arr.map((item, i, arr) => {
            if (i === (arr.length - 1)) { // time
              return item
            }
            return item / scale
          })
        })
      }
      return {
        ...series,
        points,
        unit,
      }
    },
  },
}
</script>

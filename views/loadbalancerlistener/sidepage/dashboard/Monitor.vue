<template>
  <div>
    <div class="detail-title">监控数据</div>
    <monitor-control v-model="form" @refresh="fetchData" />
    <div class="mt-5">
      <div class="title mt-2">网络流量({{bpsUnit}}/s)</div>
      <influx-line :options="netOpt" :time-format="timeFormat" />
      <div class="title mt-3">连接速率(次/s)</div>
      <influx-line :options="connectOpt" :time-format="timeFormat" />
      <div class="title mt-3">异常状态(次/s)</div>
      <influx-line :options="negativeOpt" :time-format="timeFormat" />
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import MonitorControl from './MonitorControl'
import { HAD_DASHBOARD_DATA } from './constants'
import InfluxLine from './components/Line'
import influxdb from '@/utils/influxdb'
import { sizestr, UNITS } from '@/utils/utils'

const LINE_POINT = 50
const LB_HOST = 'lbagent1'
const FRONTEND = 'FRONTEND'
const isObject = v => R.is(Object, v)
const isArray = v => R.is(Array, v)

const commonLbSql = (pxname, svname, host, selected, limit, perfixLimit, time, groupBy, fill) => {
  let timeSql = ''
  const [startTime, endTime] = time
  if (time && isArray(time)) {
    timeSql = `and time >= ${startTime}ms and time <= ${endTime}ms`
  }
  return `select ${selected} from haproxy where pxname = '${pxname}' and svname =${svname} ${perfixLimit} ${timeSql} ${groupBy} ${fill};`
}

const lbQuery = (fieldType, lsType, lsId, host, time, aggregate, isRule) => {
  const timeDiff = (time[1] - time[0]) / 1000
  const groupBy = `${timeDiff / LINE_POINT}s`
  const accidentArr = ['2xx', '3xx', '4xx', '5xx', 'other']
  const accidentSql = accidentArr.reduce((a, b) => {
    return `${a} ,non_negative_derivative(${aggregate}(hrsp_${b}), 1s) as hrsp_${b}`
  }, ` ,non_negative_derivative(${aggregate}(hrsp_1xx), 1s) as hrsp_1xx`)

  const fields = {
    status: {
      selected: 'check_status, check_code',
      perfixLimit: 'group by pxname, svname fill(none) order by time desc limit 1',
      pxname: {
        tcp: `backends_listener-${lsId}`,
        http: `backends_listener_default-${lsId}`,
        https: `backends_listener_default-${lsId}`,
      },
      svname: '~ /........-....-....-....-............/',
    },
    bps: {
      selected: `non_negative_derivative(${aggregate}(bin), 1s) * 8 as in_bps, non_negative_derivative(${aggregate}(bout), 1s) * 8 as out_bps`,
      pxname: lsId,
      svname: `'${FRONTEND}'`,
    },
    rate: {
      selected: {
        http: `${aggregate}(req_rate) as req_rate, ${aggregate}(conn_rate) as conn_rate`,
        https: `${aggregate}(req_rate)as req_rate, ${aggregate}(conn_rate) as conn_rate`,
        tcp: `${aggregate}(conn_rate) as conn_rate`,
      },
      pxname: lsId,
      svname: `'${FRONTEND}'`,
    },
    accident: {
      selected: {
        http: `non_negative_derivative(${aggregate}(dreq), 1s) as dreq, non_negative_derivative(${aggregate}(dcon), 1s) as dcon${accidentSql}`,
        https: `non_negative_derivative(${aggregate}(/d(req|con)/), 1s), non_negative_derivative(${aggregate}(/hrsp_.+/), 1s)${accidentSql}`,
        tcp: `non_negative_derivative(${aggregate}("dcon"), 1s) as dcon`,
      },
      pxname: lsId,
      svname: `'${FRONTEND}'`,
    },
  }
  const ruleFields = {
    bps: {
      selected: `non_negative_derivative(${aggregate}(bin), 1s) * 8 as in_bps, non_negative_derivative(${aggregate}(bout), 1s) * 8 as out_bps`,
      pxname: `backends_rule_${lsId}`,
      svname: `BACKEND`,
    },
    rate: {
      selected: {
        http: `${aggregate}(req_rate) as req_rate, ${aggregate}(conn_rate) as conn_rate`,
        https: `${aggregate}(req_rate)as req_rate, ${aggregate}(conn_rate) as conn_rate`,
      },
      pxname: `backends_rule_${lsId}`,
      svname: `BACKEND`,
    },
    accident: {
      selected: {
        http: `non_negative_derivative(${aggregate}(dreq), 1s) as dreq, non_negative_derivative(${aggregate}(dcon), 1s) as dcon${accidentSql}`,
        https: `non_negative_derivative(${aggregate}(/d(req|con)/), 1s), non_negative_derivative(${aggregate}(/hrsp_.+/), 1s)${accidentSql}`,
      },
      pxname: `backends_rule_${lsId}`,
      svname: `BACKEND`,
    },
  }
  const fieldItem = isRule ? ruleFields[fieldType] : fields[fieldType]
  let { selected, perfixLimit = '', pxname, svname, limit } = fieldItem
  let groupByStr = ''
  let fill = 'fill(none)'
  if (isObject(selected)) selected = selected[lsType]
  if (isObject(pxname)) pxname = pxname[lsType]
  if (!selected) console.error(`没有找到监听类型为 ${lsType} 的 ${fieldType} 数据的 selected 字段`)
  if (!selected) console.error(`没有找到监听类型为 ${lsType} 的 ${fieldType} 数据 pxname 字段`)
  if (groupBy) groupByStr = `group by time(${groupBy})`
  if (fieldType === 'status') {
    time = ''
    groupByStr = ''
    fill = ''
  }
  return commonLbSql(pxname, svname, host, selected, limit, perfixLimit, time, groupByStr, fill)
}

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
        timeRange: [this.$moment(+new Date() - 1000 * 3600 * 24 * 30), this.$moment(+new Date())], // 1个月
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
      const [startTime, endTime] = this.form.timeRange
      const timeRange = (endTime - startTime) / 1000 // 秒
      if (timeRange <= 3600 * 24) { // 小于1天
        return 'HH:mm:ss'
      } else if (timeRange >= (3600 * 24) && timeRange <= (3600 * 24 * 30)) { // 大于1天，小于30天
        return 'DD日: HH:mm:ss'
      } else if (timeRange >= (3600 * 24 * 30) && timeRange <= (3600 * 24 * 30 * 12)) { // 大于1月，小于1年
        return 'MM月DD日: HH:mm:ss'
      } else { // 大于1年
        return 'YYYY年MM月DD日: HH:mm:ss'
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
      this.getData('bps', this.form.timeRange, this.form.aggregate)
      this.getData('rate', this.form.timeRange, this.form.aggregate)
      this.getData('accident', this.form.timeRange, this.form.aggregate)
    },
    async getData (fieldType, timeRange, aggregate) {
      timeRange = timeRange.map(val => new Date(val).getTime())
      const isRule = this.data.type === 2
      let res = await influxdb.get('', {
        params: {
          q: lbQuery(fieldType, this.listenerType, this.data.id, LB_HOST, timeRange, aggregate, isRule),
          db: 'telegraf',
          epoch: 'ms',
        },
      })
      this._getResultData(res, fieldType)
    },
    _getResultData ({ data: { results = [] } }, fieldType) {
      switch (fieldType) {
        // case 'status':
        //   this.turnToTableData(results)
        //   break;
        case 'bps':
          this.netOpt = this._getSeries(results, true)
          const { unit } = this.netOpt
          this.bpsUnit = unit
          break
        case 'rate':
          this.connectOpt = this._getSeries(results)
          break
        case 'accident':
          const obj = {
            chart: {
              grid: {
                top: '25%',
              },
            },
          }
          this.negativeOpt = { ...this._getSeries(results), ...obj }
          break
      }
    },
    _getSeries (results, needCompute) {
      if (results[0] && results[0].series && results[0].series[0]) {
        let series = results[0].series[0]
        if (needCompute) series = this.__autoCompute(series)
        return series
      }
      return {}
    },
    __autoCompute (series) {
      let { values } = series
      let unit = 'B'
      const deleteTimeValues = values.map(arr => arr.slice(1))
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
        values = values.map(arr => {
          return arr.map((item, i) => {
            if (i === 0) { // time
              return item
            }
            return item / scale
          })
        })
      }
      return {
        ...series,
        values,
        unit,
      }
    },
  },
}
</script>

<template>
  <div>
    <div v-if="hadMonitor">
      <monitor
        :time.sync="time"
        :timeGroup.sync="timeGroup"
        :monitorList="monitorList"
        :loading="loading"
        @refresh="fetchData" />
    </div>
    <template v-else>
      <a-alert
        message="当前云厂商暂未对接"
        class="mb-2"
        description="目前仅阿里云和华为云支持查看监控数据"
        type="warning" />
    </template>
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import { RDS_MONITOR_OPTS } from '@DB/constants'
import influxdb from '@/utils/influxdb'
import { UNITS, autoComputeUnit } from '@/utils/utils'
import Monitor from '@/sections/Monitor'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'RDSnitorSidepage',
  components: {
    Monitor,
  },
  mixins: [WindowsMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      loading: false,
      time: '1h',
      timeGroup: '5m',
      monitorList: [],
    }
  },
  computed: {
    brand () {
      if (this.data.brand) {
        return this.data.brand.toLowerCase()
      }
      return ''
    },
    hadMonitor () {
      const brand = this.data.brand.toLowerCase()
      const surportBrand = [HYPERVISORS_MAP.aliyun.key, HYPERVISORS_MAP.huawei.key]
      return surportBrand.includes(brand)
    },
    monitorConstants () {
      const brand = this.brand
      return RDS_MONITOR_OPTS[brand] || []
    },
    dbId () {
      return this.data.id
    },
  },
  created () {
    this.fetchData()
    this.fetchDataDebounce = _.debounce(this.fetchData, 500)
    this.baywatch(['time', 'timeGroup', 'data.id'], this.fetchDataDebounce)
  },
  methods: {
    sql (dashboardItem) {
      let str = `"rds_id" = '${this.dbId}'`
      if (R.is(Object, dashboardItem.tags)) {
        R.forEachObjIndexed((value, key) => {
          str += ` AND "${key}" = '${value}'`
        }, dashboardItem.tags)
      }
      return `(${str}) AND time > now() - ${this.time} GROUP BY *, time(${this.timeGroup}) FILL(none)`
    },
    async fetchData () {
      this.loading = true
      const resList = []
      for (let idx = 0; idx < this.monitorConstants.length; idx++) {
        const val = this.monitorConstants[idx]
        try {
          let meanStr = ''
          if (val.as) {
            const asItems = val.as.split(',')
            meanStr = val.seleteItem.split(',').map((val, i) => `mean("${val}") as "${asItems[i]}"`).join(',')
          } else {
            meanStr = val.seleteItem.split(',').map(val => `mean("${val}") as "${val}"`).join(',')
          }
          const { data: { results } } = await influxdb.get('', {
            params: {
              db: 'telegraf',
              q: `SELECT ${meanStr} FROM "telegraf"."30day_only"."${val.fromItem}" WHERE ${this.sql(val)}`,
              epoch: 'ms',
            },
          })
          resList.push({ title: val.label, constants: val, ...results[0] })
          if (idx === this.monitorConstants.length - 1) {
            this.loading = false
            this.getMonitorList(resList)
          }
        } catch (error) {
          this.loading = false
          throw error
        }
      }
    },
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    getMonitorList (resList) {
      const lineConfig = { // 宿主机指标比较多，样式fix
        tooltip: {
          confine: true,
        },
        grid: {
          top: '20%',
        },
      }
      this.monitorList = resList.map(result => {
        const { unit, transfer, fromItem } = result.constants
        const isSizestrUnit = UNITS.includes(unit)
        let series = result.series
        if (!series) series = []
        if (series.length && (fromItem.includes('disk'))) { // 虚拟机的逻辑暂时拿过来(未用到)这里会把不同路径下的磁盘监控信息都返回，在这里整理一下
          let tag = 'name'
          let label = ''
          if (fromItem === 'disk') {
            tag = 'path'
            label = '路径: '
          }
          const columns = ['time']
          const values = series[0].values.map(val => [val[0]])
          series.forEach(val => {
            columns.push(`${label}${val.tags[tag]}`)
            for (let i = 0; i < values.length; i++) {
              const noTimeValues = val.values[i].slice(1)
              values[i].push(...noTimeValues)
            }
          })
          series = [{
            name: series[0].name,
            columns, // ['time', '/', '/opt', '/opt/test']
            values,
            lineConfig,
          }]
        }
        if (isSizestrUnit || unit === 'bps') {
          series = series.map(serie => {
            return autoComputeUnit(serie, unit, transfer)
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
  },
}
</script>

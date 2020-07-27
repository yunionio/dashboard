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
    <a-alert
      v-else
      :message="$t('storage.text_148')"
      :description="$t('storage.text_149')"
      type="warning" />
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import { OSS_MONITOR_OPTS } from '@Storage/constants'
import influxdb from '@/utils/influxdb'
import { UNITS, autoComputeUnit } from '@/utils/utils'
import Monitor from '@/sections/Monitor'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'BucketMonitorSidepage',
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
    hadMonitor () {
      const brand = this.data.brand.toLowerCase()
      const surportBrand = [HYPERVISORS_MAP.aliyun.key, HYPERVISORS_MAP.huawei.key]
      return surportBrand.includes(brand)
    },
    monitorConstants () {
      if (this.data.brand) {
        const brand = this.data.brand.toLowerCase()
        return OSS_MONITOR_OPTS[brand] || []
      }
      return []
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
      let str = `"oss_id" = '${this.dbId}'`
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
        const { unit, transfer } = result.constants
        const isSizestrUnit = UNITS.includes(unit)
        let series = result.series
        if (!series) series = []
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

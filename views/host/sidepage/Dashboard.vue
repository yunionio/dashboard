<template>
  <div>
    <a-divider orientation="left">容量统计</a-divider>
      <a-row class="mb-2" :gutter="{ lg: 24, xl: 12, xxl: 24 }">
        <a-col class="mb-3" :lg="12" :xl="6" v-for="item in progressList" :key="item.label">
          <progress-card :progress="item" />
        </a-col>
      </a-row>
    <a-divider class="mt-3" orientation="left">实时监控</a-divider>
    <a-spin :spinning="loading">
      <a-row class="mb-2" :gutter="{ lg: 24, xl: 12, xxl: 24 }">
        <a-col class="mb-3" :lg="12" :xl="6" v-for="item in gaugeList" :key="item.label">
          <progress-card
            :progress="item"
            :progress-props="item.progressProps"
            :unit="item.unit"
            :numerifyFloat="item.numerifyFloat"
            :percentFormat="item.percentFormat" />
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script>
import numerify from 'numerify'
import { GAUGEMSG } from '../constants'
import influxdb from '@/utils/influxdb'
import ProgressCard from '@/sections/ProgressCard'
import { sizestrWithUnit } from '@/utils/utils'

export default {
  name: 'HostDashboard',
  components: {
    ProgressCard,
  },
  props: {
    resId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      progressList: [],
      gaugeList: [],
      loading: false,
    }
  },
  created () {
    this.turnToList(this.data)
    this._fetchData()
  },
  methods: {
    async _fetchData () {
      this.loading = true
      for (let i = 0; i < GAUGEMSG.length; i++) {
        try {
          const value = GAUGEMSG[i]
          let q
          if (value.sql.db === 'net') {
            q = `SELECT max("${value.sql.key}") FROM "${value.sql.db}" WHERE "interface" = 'eth0' AND "host_id" = '${this.resId}' AND time > now() - 1m GROUP BY time(1m) fill(0)`
          } else {
            q = `SELECT mean("${value.sql.key}") FROM "${value.sql.db}" WHERE "host_id" = '${this.resId}' AND time > now() - 1m GROUP BY time(1m) fill(0)`
          }
          await influxdb.get('', {
            params: {
              db: 'telegraf',
              q,
              epoch: 'ms',
            },
          }).then(({ data: { results } }) => {
            const series = results[0].series || [{ values: [] }]
            let temValues = series[0].values.map(v => (v[1] || 0))
            const maxNum = temValues.length ? Math.max.apply(null, temValues) : 0
            let unit = '%'
            let numerifyFloat = '0.00'
            let percent = maxNum / 100
            if (value.label === '系统负载') {
              unit = ''
              numerifyFloat = '0.0000'
              percent = maxNum
              var percentFormat = this.percentFormat
            }
            this.gaugeList.push({
              title: value.label,
              percent,
              unit,
              numerifyFloat,
              percentFormat,
              progressProps: {
                type: 'dashboard',
              },
            })
          })
        } catch (error) {
          this.loading = false
          throw error
        }
      }
      this.loading = false
    },
    percentFormat (vm) {
      const per = (vm.percent || 0) / 100
      const oversell = per > 100 ? <a-tag color="red">超售</a-tag> : null
      return (<div>{oversell}<div class="mt-2 text-color">{ numerify(per, vm.numerifyFloat) }{ vm.unit }</div></div>)
    },
    turnToList (obj) {
      let tempList = new Array(4)
      tempList[0] = (() => {
        const current = obj.cpu_commit || 0
        const total = obj.cpu_count - (obj.cpu_reserved || 0)
        return {
          title: 'CPU',
          percent: total ? (current / total) : 0,
          msg: {
            current,
            total,
            currentLabel: '运行中',
          },
        }
      })()
      tempList[1] = (() => {
        const current = obj.mem_commit || 0
        const total = (obj.mem_size - (obj.mem_reserved || 0)) || 0
        return {
          title: '内存',
          percent: total ? (current / total) : 0,
          msg: {
            current: sizestrWithUnit(current, 'M', 1024),
            currentLabel: '运行中',
            total: sizestrWithUnit(total, 'M', 1024),
          },
        }
      })()
      tempList[2] = (() => {
        const current = obj.storage_used || 0
        const total = obj.storage_size || 0
        return {
          title: '本地存储',
          percent: total ? (current / total) : 0,
          msg: {
            current: sizestrWithUnit(current, 'M', 1024),
            total: sizestrWithUnit(total, 'M', 1024),
          },
        }
      })()
      tempList[3] = (() => {
        const current = obj.running_guests || 0
        const total = obj.guests || 0
        return {
          title: '云服务器',
          percent: total ? (current / total) : 0,
          msg: {
            current,
            currentLabel: '运行中',
            total,
            totalLabel: '总数',
          },
        }
      })()
      this.progressList = tempList
    },
  },
}
</script>

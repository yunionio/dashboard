<template>
  <monitor
    :time.sync="time"
    :timeGroup.sync="timeGroup"
    :monitorList="monitorList"
    :singleActions="singleActions"
    :loading="loading"
    @refresh="fetchData" />
</template>

<script>
import _ from 'lodash'
import { KVM_MONITOR_OPTS, VMWARE_MONITOR_OPTS } from '../constants'
import influxdb from '@/utils/influxdb'
import { UNITS, autoComputeUnit } from '@/utils/utils'
import Monitor from '@/sections/Monitor'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VminstanceMonitorSidepage',
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
      singleActions: [
        // {
        //   label: '设置报警',
        //   action: async obj => {
        //     const alertManager = new this.$Manager('nodealerts', 'v1')
        //     const { metric } = obj.constants
        //     const { data: { data = [] } } = await alertManager.list({
        //       params: {
        //         type: 'guest',
        //         node_id: this.data.id,
        //         metric,
        //       },
        //     })
        //     if (data && data.length) {
        //       if (data.length === 1) {
        //         this.createDialog('UpdateNodeAlert', {
        //           data,
        //           alertType: 'guest',
        //           alertManager,
        //         })
        //       } else {
        //         throw Error('后端返回数据错误，同个指标返回多个数据')
        //       }
        //     } else { // 新建报警
        //       this.createDialog('CreateNodeAlert', {
        //         alertType: 'guest',
        //         nodeId: this.data.id,
        //         metric,
        //         alertManager,
        //       })
        //     }
        //   },
        // },
      ],
      loading: false,
      time: '1h',
      timeGroup: '5m',
      monitorList: [],
    }
  },
  computed: {
    hostType () {
      return this.data.host_type
    },
    monitorConstants () {
      if (this.hostType === 'hypervisor') {
        return KVM_MONITOR_OPTS
      }
      return VMWARE_MONITOR_OPTS
    },
    hostId () {
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
      const sqlObj = {
        tag: 'host_id',
        str: `"host_id" = '${this.hostId}'`,
        str2: '',
      }
      if (dashboardItem.fromItem === 'diskio') {
        sqlObj.str2 = ', "name"'
      } else if (dashboardItem.fromItem === 'disk') {
        sqlObj.str2 = ', "path"'
      } else {
        sqlObj.str2 = ''
      }
      return `${sqlObj.str} AND time > now() - ${this.time} GROUP BY time(${this.timeGroup}), "${sqlObj.tag}"${sqlObj.str2} FILL(none)`
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
        if (series.length && (fromItem === 'disk' || fromItem === 'diskio')) { // 这里会把不同路径下的磁盘监控信息都返回，在这里整理一下
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

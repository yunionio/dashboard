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
import { ONECLOUD_MONITOR, VMWARE_MONITOR, OTHER_MONITOR } from '@Compute/views/vminstance/constants'
import influxdb from '@/utils/influxdb'
import { UNITS, autoComputeUnit } from '@/utils/utils'
import Monitor from '@/sections/Monitor'
import { HYPERVISORS_MAP } from '@/constants'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BaremetalMonitorSidepage',
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
        {
          label: '设置报警',
          action: async obj => {
            const alertManager = new this.$Manager('nodealerts', 'v1')
            const { metric } = obj.constants
            const { data: { data = [] } } = await alertManager.list({
              params: {
                type: 'guest',
                node_id: this.data.id,
                metric,
              },
            })
            if (data && data.length) {
              if (data.length === 1) {
                this.createDialog('UpdateNodeAlert', {
                  data,
                  alertType: 'guest',
                  alertManager,
                })
              } else {
                throw Error('后端返回数据错误，同个指标返回多个数据')
              }
            } else { // 新建报警
              this.createDialog('CreateNodeAlert', {
                alertType: 'guest',
                nodeId: this.data.id,
                metric,
                alertManager,
              })
            }
          },
        },
      ],
      loading: false,
      time: '1h',
      timeGroup: '5m',
      monitorList: [],
    }
  },
  computed: {
    hypervisor () {
      return this.data.hypervisor
    },
    monitorConstants () {
      if (this.hypervisor === HYPERVISORS_MAP.esxi.key) {
        return VMWARE_MONITOR
      } else if (this.hypervisor === HYPERVISORS_MAP.kvm.key) {
        return ONECLOUD_MONITOR
      } else {
        return OTHER_MONITOR
      }
    },
    serverId () {
      return this.data.id
    },
    sql () {
      return `time > now() - ${this.time} AND "vm_id"='${this.serverId}' GROUP BY time(${this.timeGroup}) FILL(none)`
    },
  },
  created () {
    this.fetchData()
    this.fetchDataDebounce = _.debounce(this.fetchData, 500)
    this.baywatch(['time', 'timeGroup', 'data.id'], this.fetchDataDebounce)
  },
  methods: {
    async fetchData () {
      this.loading = true
      const resList = []
      for (let idx = 0; idx < this.monitorConstants.length; idx++) {
        let val = this.monitorConstants[idx]
        try {
          let { data: { results } } = await influxdb.get('', {
            params: {
              db: 'telegraf',
              q: `SELECT mean("${val.seleteItem}") as "${val.label}" FROM "telegraf"."30day_only"."${val.fromItem}" WHERE ${this.sql}`,
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
        }
      })
    },
  },
}
</script>

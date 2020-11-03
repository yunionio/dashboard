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
import { UNITS, autoComputeUnit, getRequestT } from '@/utils/utils'
import Monitor from '@/sections/Monitor'
import WindowsMixin from '@/mixins/windows'
import { getSignature } from '@/utils/crypto'

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
    async fetchData () {
      this.loading = true
      const resList = []
      for (let idx = 0; idx < this.monitorConstants.length; idx++) {
        const val = this.monitorConstants[idx]
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
    genQueryData (val) {
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
              type: 'mean',
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
              type: 'mean',
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
              tags: [
                {
                  key: 'host_id',
                  value: this.hostId,
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
      data.signature = getSignature(data)
      return data
    },
  },
}
</script>

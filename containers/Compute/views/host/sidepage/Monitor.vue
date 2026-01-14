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
import MonitorTimeMixin from '@/mixins/monitorTime'
import { KVM_MONITOR_OPTS, VMWARE_MONITOR_OPTS, NIC_RSRC_MON_OPTS, RADEONTOP_OPTS, VASMI_OPTS } from '../constants'

export default {
  name: 'VminstanceMonitorSidepage',
  components: {
    Monitor,
  },
  mixins: [WindowsMixin, MonitorTimeMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
    needFetchResource: {
      type: Boolean,
      default: false,
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
      time: '168h',
      timeGroup: '30m',
      customTime: null,
      groupFunc: 'mean',
      monitorList: [],
      host: this.data,
    }
  },
  computed: {
    hostType () {
      return this.host.host_type
    },
    isolatedDeviceTypes () {
      return Object.keys(this.host.isolated_device_type_count || {})
    },
    monitorConstants () {
      let list = VMWARE_MONITOR_OPTS
      if ((this.hostType === 'hypervisor' || this.hostType === 'container') && !this.host.manager_id) {
        list = [...KVM_MONITOR_OPTS]
        if (this.isolatedDeviceTypes.some(type => ['NETINT_CA_QUADRA', 'NETINT_CA_ASIC'].includes(type))) {
          list = [...list, ...NIC_RSRC_MON_OPTS]
        }
        if (this.isolatedDeviceTypes.some(type => ['CPH_AMD_GPU'].includes(type))) {
          list = [...list, ...RADEONTOP_OPTS]
        }
        if (this.isolatedDeviceTypes.some(type => ['VASTAITECH_GPU'].includes(type))) {
          list = [...list, ...VASMI_OPTS]
        }
      }
      return list
    },
    hostId () {
      return this.host.id
    },
  },
  async created () {
    this.fetchResource()
    this.fetchDataDebounce = _.debounce(this.fetchData, 500)
    this.baywatch(['time', 'timeGroup', 'customTime', 'groupFunc'], this.fetchDataDebounce)
    this.baywatch(['data.id'], this.fetchResource)
  },
  methods: {
    async fetchResource () {
      if (this.needFetchResource) {
        try {
          const { data } = await new this.$Manager('hosts', 'v1').get({ id: this.data.id, params: { details: true } })
          this.host = data
          this.fetchData()
        } catch (err) {
          this.fetchData()
        }
      } else {
        this.fetchData()
      }
    },
    async fetchData () {
      this.loading = true
      const valList = []
      const reqList = this.monitorConstants.map(item => {
        const val = { ...item, groupFunc: this.groupFunc }
        valList.push(val)
        return new this.$Manager('unifiedmonitors', 'v1')
          .performAction({
            id: 'query',
            action: '',
            data: this.genQueryData(val),
            params: { $t: getRequestT() },
          })
      })
      const resList = (await Promise.all(reqList)).map((item, index) => ({ ...item.data, title: valList[index].label, constants: valList[index] }))
      this.loading = false
      this.getMonitorList(resList)
      this.saveMonitorConfig()
    },
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    getMonitorList (resList) {
      const lineConfig = { // 宿主机指标比较多，样式fix
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
      if (!val.extraTags) {
        val.extraTags = []
      }
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
              type: opt.groupFunc || opt.selectFunction || 'mean',
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
              type: opt.groupFunc || opt.selectFunction || 'mean',
              params: [],
            },
            { // 确保后端返回columns有 val.label 的别名
              type: 'alias',
              params: [val],
            },
          ]
        })
      }
      const model = {
        measurement: val.fromItem,
        select,
        group_by: [
          // { type: 'tag', params: ['host_id'] },
        ],
        tags: [
          {
            key: 'host_id',
            value: this.hostId,
            operator: '=',
          },
          ...val.extraTags,
        ],
      }
      if (val.groupBy && val.groupBy.length > 0) {
        val.groupBy.forEach(group => {
          model.group_by.push({
            type: 'tag',
            params: [group],
          })
        })
      }
      const data = {
        metric_query: [
          {
            model,
          },
        ],
        scope: this.$store.getters.scope,
        from: this.time,
        interval: this.timeGroup,
        unit: true,
        skip_check_series: true,
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

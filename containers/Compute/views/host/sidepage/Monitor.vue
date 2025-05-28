<template>
  <div>
    <dashboard-cards ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import { KVM_MONITOR_OPTS, VMWARE_MONITOR_OPTS, NIC_RSRC_MON_OPTS, RADEONTOP_OPTS, VASMI_OPTS } from '../constants'

export default {
  name: 'HostMonitorSidepage',
  components: {
    DashboardCards,
  },
  mixins: [WindowsMixin],
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
      host: this.data,
      singleActions: [],
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
      if (this.hostType === 'hypervisor' || this.hostType === 'container') {
        let list = [...KVM_MONITOR_OPTS]
        if (this.isolatedDeviceTypes.some(type => ['NETINT_CA_QUADRA', 'NETINT_CA_ASIC'].includes(type))) {
          list = [...list, ...NIC_RSRC_MON_OPTS]
        }
        if (this.isolatedDeviceTypes.some(type => ['CPH_AMD_GPU'].includes(type))) {
          list = [...list, ...RADEONTOP_OPTS]
        }
        if (this.isolatedDeviceTypes.some(type => ['VASTAITECH_GPU'].includes(type))) {
          list = [...list, ...VASMI_OPTS]
        }
        return list
      }
      return VMWARE_MONITOR_OPTS
    },
    hostId () {
      return this.host.id
    },
    localPanels () {
      return this.monitorConstants.map(item => {
        return {
          panel_name: `${item.label}${item.metric ? `(${item.metric})` : `(${item.fromItem}.${item.seleteItem})`}`,
          constants: item,
          queryData: this.genQueryData(item),
        }
      })
    },
  },
  created () {
    this.$bus.$on('VmMonitorTypeChange', (tab) => {
      this.$refs.dashboardCards.initMonitorConfig()
    })
  },
  methods: {
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
        unit: true,
        skip_check_series: true,
      }
      return data
    },
  },
}
</script>

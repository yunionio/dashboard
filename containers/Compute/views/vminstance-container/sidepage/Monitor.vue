<template>
  <div>
    <a-tabs @change="handleTabChange">
      <a-tab-pane key="basic" :tab="$t('compute.monitor.basic')">
        <base-monitor :data="data" :constants="monitorConstants" monitorType="basic" :currentMonitorType="currentMonitorType" />
      </a-tab-pane>
      <a-tab-pane key="agent" :tab="$t('compute.monitor.agent')">
        <div>
          <install-agent-form-visible
            :data="data"
            :serverColumns="serverColumns"
            :isPageDestroyed="isPageDestroyed" />
          <agent-monitor
            :data="data"
            :currentMonitorType="currentMonitorType"
            monitorType="agent"
            key="monitor-agent" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'
import AgentMonitor from '@Compute/sections/monitor/AgentMonitor.vue'
import { ONECLOUD_MONITOR, VMWARE_MONITOR, OTHER_MONITOR } from '@Compute/views/vminstance/constants'
import { HYPERVISORS_MAP } from '@/constants'
import WindowsMixin from '@/mixins/windows'
import InstallAgentFormVisible from '../../vminstance/components/InstallAgentFormVisible'

export default {
  name: 'VminstanceMonitorSidepage',
  components: {
    BaseMonitor,
    AgentMonitor,
    InstallAgentFormVisible,
  },
  mixins: [WindowsMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
    serverColumns: {
      type: Array,
      required: true,
    },
    isPageDestroyed: Boolean,
  },
  data () {
    return {
      currentMonitorType: 'basic',
      alertType: 'warning',
      time: '1h',
      timeGroup: '1m',
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
        // aliyun apsara 虚拟机磁盘使用率增加groupBy: device
        const otherMonitor = OTHER_MONITOR.map(item => {
          if (['Aliyun', 'Apsara'].includes(this.data.brand) && item.fromItem === 'vm_disk') {
            item.groupBy = ['device']
          }
          // azure windows 虚拟机磁盘使用率增加groupBy: device
          if (['Azure'].includes(this.data.brand) && item.fromItem === 'vm_disk' && this.data.os_type === 'Windows') {
            item.groupBy = ['device']
          }
          return item
        })
        return otherMonitor
      }
    },
    serverId () {
      return this.data.id
    },
  },
  methods: {
    handleTabChange (tab) {
      this.currentMonitorType = tab
    },
  },
}
</script>

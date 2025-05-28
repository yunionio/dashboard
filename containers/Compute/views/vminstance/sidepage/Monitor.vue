<template>
  <div>
    <a-tabs @change="handleTabChange">
      <a-tab-pane v-for="type in types" :key="type" :tab="$t(`compute.monitor.${type}`)">
        <base-monitor v-if="type === 'basic'" :data="server" :constants="monitorConstants" idKey="vm_id" monitorType="basic" :currentMonitorType="currentMonitorType" />
        <div v-else>
          <install-agent-form-visible
            :data="server"
            :serverColumns="serverColumns"
            :isPageDestroyed="isPageDestroyed" />
          <agent-monitor
            :data="server"
            :currentMonitorType="currentMonitorType"
            idKey="vm_id"
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
import { ONECLOUD_MONITOR, VMWARE_MONITOR, OTHER_MONITOR, SANGFOR_MONITOR } from '@Compute/views/vminstance/constants'
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
    needFetchResource: {
      type: Boolean,
      default: false,
    },
    agentStatus: String,
  },
  data () {
    return {
      currentMonitorType: this.data.hypervisor === 'kvm' ? 'agent' : 'basic',
      alertType: 'warning',
      time: '1h',
      timeGroup: '1m',
      monitorList: [],
      server: this.data,
      types: this.data.hypervisor === 'kvm' ? ['agent', 'basic'] : ['basic', 'agent'],
    }
  },
  computed: {
    hypervisor () {
      return this.server.hypervisor
    },
    monitorConstants () {
      if (this.hypervisor === HYPERVISORS_MAP.esxi.key) {
        return VMWARE_MONITOR
      } else if (this.hypervisor === HYPERVISORS_MAP.kvm.key) {
        return ONECLOUD_MONITOR
      } else if (this.hypervisor === HYPERVISORS_MAP.sangfor.key) {
        return SANGFOR_MONITOR
      } else {
        // aliyun apsara 虚拟机磁盘使用率增加groupBy: device
        const otherMonitor = OTHER_MONITOR.map(item => {
          if (['Aliyun', 'Apsara'].includes(this.server.brand) && item.fromItem === 'vm_disk') {
            item.groupBy = ['device']
          }
          // azure windows 虚拟机磁盘使用率增加groupBy: device
          if (['Azure'].includes(this.server.brand) && item.fromItem === 'vm_disk' && this.server.os_type === 'Windows') {
            item.groupBy = ['device']
          }
          return item
        })
        return otherMonitor
      }
    },
    serverId () {
      return this.server.id
    },
  },
  watch: {
    'data.id' () {
      this.fetchResource()
    },
  },
  created () {
    this.fetchResource()
  },
  methods: {
    async fetchResource () {
      if (this.needFetchResource) {
        try {
          const { data } = await new this.$Manager('servers', 'v1').get({ id: this.data.id, params: { details: true } })
          this.server = data
        } catch (err) {
          throw err
        }
      }
    },
    handleTabChange (tab) {
      this.currentMonitorType = tab
      this.$nextTick(() => {
        this.$bus.$emit('VmMonitorTypeChange', tab)
      })
    },
  },
}
</script>

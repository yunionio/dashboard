<template>
  <div>
    <a-tabs default-active-key="basic" @change="handleTabChange">
      <a-tab-pane key="basic" :tab="$t('compute.monitor.basic')">
        <base-monitor :data="data" :constants="monitorConstants" />
      </a-tab-pane>
      <a-tab-pane key="agent" :tab="$t('compute.monitor.agent')">
        <div>
          <install-agent-form-visible
            :data="data"
            :serverColumns="serverColumns"
            :isPageDestroyed="isPageDestroyed" />
          <agent-monitor
            :data="data"
            key="monitor-agent" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import BaseMonitor from '@Compute/sections/monitor/BaseMonitor'
import AgentMonitor from '@Compute/sections/monitor/AgentMonitor.vue'
import InstallAgentFormVisible from '../../vminstance/components/InstallAgentFormVisible'
import { ONECLOUD_MONITOR, VMWARE_MONITOR, OTHER_MONITOR } from '@Compute/views/vminstance/constants'
import { HYPERVISORS_MAP } from '@/constants'
import WindowsMixin from '@/mixins/windows'

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
        return OTHER_MONITOR
      }
    },
    serverId () {
      return this.data.id
    },
  },
  methods: {
    handleTabChange (tab) {
    },
  },
}
</script>

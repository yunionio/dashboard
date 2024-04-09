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
import { ONECLOUD_MONITOR } from '@Compute/views/vminstance/constants'
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
      monitorConstants: ONECLOUD_MONITOR,
    }
  },
  computed: {
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

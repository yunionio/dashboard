<template>
  <div>
    <install-agent-form-visible :data="data" :serverColumns="[]" :isPageDestroyed="isPageDestroyed" />
    <!-- monitor tabs -->
    <div>
      <a-tabs default-active-key="agent-basic" @change="handleTabChange">
        <a-tab-pane key="agent-basic" :tab="$t('compute.monitor.agent')">
          <agent-monitor
            :data="data"
            idKey="vm_id"
            v-if="true" />
        </a-tab-pane>
        <a-tab-pane key="agent-temperature" :tab="$t('compute.monitor.agent.temperature')">
          <agent-temperature-monitor
            :data="data"
            idKey="vm_id"
            v-if="true" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import AgentMonitor from '@Compute/sections/monitor/AgentMonitor.vue'
import AgentTemperatureMonitor from '@Compute/sections/monitor/AgentTemperatureMonitor.vue'
import WindowsMixin from '@/mixins/windows'
import InstallAgentFormVisible from '../../vminstance/components/InstallAgentFormVisible'

export default {
  name: 'BaremetalMonitorSidepage',
  components: {
    AgentMonitor,
    AgentTemperatureMonitor,
    InstallAgentFormVisible,
  },
  mixins: [WindowsMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
    isPageDestroyed: Boolean,
  },
  computed: {
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

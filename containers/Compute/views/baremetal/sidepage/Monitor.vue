<template>
  <div v-if="serverData">
    <install-agent-form-visible :data="serverData" :serverColumns="[]" :isPageDestroyed="isPageDestroyed" />
    <!-- monitor tabs -->
    <div>
      <a-tabs default-active-key="agent-basic" @change="handleTabChange">
        <a-tab-pane key="agent-basic" :tab="$t('compute.monitor.agent')">
          <agent-monitor
            :data="serverData"
            idKey="vm_id"
            v-if="true" />
        </a-tab-pane>
        <a-tab-pane key="agent-temperature" :tab="$t('compute.monitor.agent.temperature')">
          <agent-temperature-monitor
            :data="serverData"
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
    guest_id: String,
  },
  data () {
    return {
      serverData: null,
    }
  },
  watch: {
    guest_id: {
      async handler (val) {
        if (!val) {
          this.serverData = this.data
          return
        }
        this.serverData = await this.fetchServerData()
      },
      immediate: true,
    },
  },
  methods: {
    handleTabChange (tab) {
    },
    async fetchServerData () {
      if (this.guest_id) {
        const serverData = await new this.$Manager('servers').get({
          id: this.guest_id,
          params: {
            with_meta: true,
          },
        })
        return serverData.data
      }
      return this.data
    },
  },
}
</script>

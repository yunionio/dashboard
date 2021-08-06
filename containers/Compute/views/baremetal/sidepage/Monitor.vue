<template>
  <div>
    <div v-if="visible">
      <a-alert class="mb-2" :type="alertType" v-if="visible">
        <install-agent-form slot="message" :data="data" :serverColumns="[]" @onInstall="handleInstallResult" />
      </a-alert>
    </div>
    <!-- monitor tabs -->
    <div>
      <a-tabs default-active-key="agent-basic" @change="handleTabChange">
        <a-tab-pane key="agent-basic" :tab="$t('compute.monitor.agent')">
          <agent-monitor
            :data="data"
            v-if="true" />
        </a-tab-pane>
        <a-tab-pane key="agent-temperature" :tab="$t('compute.monitor.agent.temperature')">
          <agent-temperature-monitor
            :data="data"
            v-if="true" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import InstallAgentForm from '../../vminstance/components/InstallAgentForm'
import AgentMonitor from '@Compute/sections/monitor/AgentMonitor.vue'
import AgentTemperatureMonitor from '@Compute/sections/monitor/AgentTemperatureMonitor.vue'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BaremetalMonitorSidepage',
  components: {
    AgentMonitor,
    AgentTemperatureMonitor,
    InstallAgentForm,
  },
  mixins: [WindowsMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
  },
  data () {
    const visible = this.data.status === 'running' && (!this.data.metadata || this.data.metadata['sys:monitor_agent'] !== 'true')
    return {
      visible: visible,
      monitorList: [],
    }
  },
  computed: {
    serverId () {
      return this.data.id
    },
  },
  methods: {
    handleTabChange (tab) {
    },
    handleInstallResult (ret) {
      if (ret && ret.status === 'succeed') {
        this.alertType = 'success'
        this.$nextTick(() => {
          setTimeout(() => {
            this.visible = false
          }, 3000)
        })
      }
    },
  },
}
</script>

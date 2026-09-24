<template>
  <div>
    <a-alert v-if="showGuestMonitorTip" class="mb-2" :type="isGuestUuid ? 'info' : 'warning'" :message="guestMonitorTip" />
    <div v-if="serverData">
      <install-agent-form-visible :data="serverData" :serverColumns="[]" :isPageDestroyed="isPageDestroyed" v-if="!hideInstallAgentForm" />
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
  computed: {
    hideInstallAgentForm () {
      return this.guest_id && this.guest_id !== ''
    },
    showGuestMonitorTip () {
      return this.guest_id !== undefined
    },
    isGuestUuid () {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.guest_id || '')
    },
    guestMonitorTip () {
      return this.isGuestUuid
        ? this.$t('compute.monitor.physicalmachine.guest_assigned')
        : this.$t('compute.monitor.physicalmachine.guest_unassigned')
    },
  },
  watch: {
    guest_id: {
      async handler (val) {
        if (val) {
          this.serverData = await this.fetchServerData()
          return
        }
        // 空字符串表示物理机侧页还在等 server_id，先不要用物理机详情渲染安装状态
        if (val === '') {
          this.serverData = null
          return
        }
        this.serverData = this.data
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
        })
        return serverData.data
      }
      return this.data
    },
  },
}
</script>

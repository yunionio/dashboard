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
              :constants="agentMonitorConstants"
              idKey="vm_id"
              v-if="true" />
          </a-tab-pane>
          <a-tab-pane key="agent-temperature" :tab="$t('compute.monitor.agent.temperature')">
            <agent-temperature-monitor
              :data="serverData"
              idKey="vm_id"
              v-if="true" />
          </a-tab-pane>
          <a-tab-pane key="agent-gpu" :tab="$t('compute.monitor.gpu')">
            <agent-gpu-monitor
              :data="serverData"
              idKey="vm_id" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import AgentMonitor from '@Compute/sections/monitor/AgentMonitor.vue'
import { MONITOR_TEMPLATE_BAREMETAL, resolveMonitorTemplatePanels } from '@Monitor/utils/monitorTemplate'
import { AGENT_MONITOR } from '@Compute/views/vminstance/constants'
import AgentTemperatureMonitor from '@Compute/sections/monitor/AgentTemperatureMonitor.vue'
import AgentGpuMonitor from '@Compute/sections/monitor/AgentGpuMonitor.vue'
import WindowsMixin from '@/mixins/windows'
import InstallAgentFormVisible from '../../vminstance/components/InstallAgentFormVisible'

export default {
  name: 'BaremetalMonitorSidepage',
  components: {
    AgentMonitor,
    AgentTemperatureMonitor,
    AgentGpuMonitor,
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
    // 策略定义中配置的裸金属监控模板，对全部裸金属生效（物理机复用裸金属监控，同样生效）
    templateMonitorConstants () {
      return resolveMonitorTemplatePanels(this.$store.getters.scopedPolicy, {
        category: MONITOR_TEMPLATE_BAREMETAL,
        // 裸金属只有 Agent 监控
        monitorType: 'agent',
      })
    },
    agentMonitorConstants () {
      return this.templateMonitorConstants.length ? this.templateMonitorConstants : AGENT_MONITOR
    },
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
    // 仅裸金属侧页（未传 guest_id）同步 agent_status 等字段；物理机总会传 guest_id（'' 或 uuid）
    data: {
      handler (val) {
        if (this.guest_id !== undefined) return
        if (val) this.serverData = val
      },
      deep: true,
    },
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
  created () {
    this.fetchMonitorTemplates()
  },
  methods: {
    fetchMonitorTemplates () {
      // 监控模板在策略定义中配置，绑定的范围内全部裸金属生效
      return this.$store.dispatch('scopedPolicy/get', {
        category: [MONITOR_TEMPLATE_BAREMETAL],
      })
    },
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

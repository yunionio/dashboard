<template>
  <div class="aiproxy-access-panel p-3">
    <div v-if="onManager" class="aiproxy-access-actions mb-3">
      <a-button
        type="primary"
        size="small"
        class="mr-2"
        :loading="registerLoading"
        :disabled="!registerMeta.validate"
        v-on:click="handleRegister">
        {{ $t('aice.llm_deployment.register_aiproxy') }}
      </a-button>
      <a-button
        size="small"
        :loading="unregisterLoading"
        :disabled="!unregisterMeta.validate"
        v-on:click="handleUnregister">
        {{ $t('aice.llm_deployment.unregister_aiproxy') }}
      </a-button>
      <div v-if="registerMeta.tooltip || unregisterMeta.tooltip" class="text-color-help mt-1">
        {{ registerMeta.tooltip || unregisterMeta.tooltip }}
      </div>
    </div>
    <template v-if="!autoRegister">
      <a-empty :description="$t('aice.llm_deployment.aiproxy_routing_disabled')" />
    </template>
    <template v-else-if="syncFailed">
      <a-alert type="error" show-icon :message="formatDeploymentStatus(data.status)">
        <template v-slot:description>
          {{ $t('aice.llm_deployment.aiproxy_access_failed_hint') }}
        </template>
      </a-alert>
    </template>
    <template v-else-if="waitingSync">
      <a-spin :spinning="true">
        <div class="py-4 text-color-secondary">
          {{ $t('aice.llm_deployment.aiproxy_access_syncing') }}
        </div>
      </a-spin>
    </template>
    <template v-else>
      <a-divider orientation="left">{{ $t('aice.llm_deployment.aiproxy_instances') }}</a-divider>
      <a-table
        size="small"
        row-key="llm_id"
        :columns="accessColumns"
        :data-source="accessRows"
        :pagination="false"
        class="mb-3">
        <template v-slot:llm_id="text, row">
          <a v-if="text" @click="handleOpenLlmInstanceSidepage(text)">{{ llmInstanceName(row) }}</a>
          <span v-else>-</span>
        </template>
        <template v-slot:model="text">
          <span>{{ text || '-' }}</span>
          <copy v-if="text" class="ml-1" :message="text" />
        </template>
        <template v-slot:provider="text, row">
          <a v-if="text" @click="handleOpenAiProviderSidepage(text)">{{ row.ai_provider_name || text }}</a>
          <span v-else>-</span>
        </template>
        <template v-slot:sync_status="text">
          {{ formatSyncStatus(text) }}
        </template>
        <template v-slot:endpoint="text">
          <span>{{ text }}</span>
          <copy v-if="text" class="ml-1" :message="text" />
        </template>
      </a-table>
      <div class="text-color-help mb-2">
        {{ $t('aice.llm_deployment.aiproxy_access_need_vk') }}
      </div>
      <div class="mb-3">
        <div class="mb-1">{{ $t('aice.llm_deployment.aiproxy_access_select_vk') }}</div>
        <base-select
          v-model="selectedVirtualKeyId"
          resource="ai_virtual_keys"
          :params="virtualKeySelectParams"
          filterable
          version="v2"
          allow-clear
          class="virtual-key-select"
          @change="onVirtualKeyChange" />
      </div>
      <a-alert type="info" show-icon>
        <template slot="message">{{ $t('aice.aiproxy.endpoint_example') }}</template>
        <template slot="description">
          <pre class="mb-0">{{ curlExample }}</pre>
          <copy :message="curlExample" />
        </template>
      </a-alert>
    </template>

    <aiproxy-routing-panel :data="data" embedded />
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { Manager } from '@/utils/manager'
import AiproxyLlmLinkListMixin from '@Ai/mixins/aiproxyLlmLinkListMixin'
import { getAiproxySelectParams } from '@Ai/constants/aiproxyResources'
import {
  buildAiproxyCurlExample,
  resolveAiproxyChatCompletionsUrl,
} from '@Ai/utils/aiproxyEndpoint'
import { getLlmInstanceDisplayName } from '@Ai/utils/llmInstanceNames'
import {
  getRegisterAiproxyMeta,
  getUnregisterAiproxyMeta,
  performLlmDeploymentRegisterAiproxy,
  performLlmDeploymentUnregisterAiproxy,
  pollDeploymentDetailRefresh,
} from '@Ai/utils/aiproxyDeploymentActions'
import AiproxyRoutingPanel from './AiproxyRoutingPanel'

const POLL_INTERVAL_MS = 5000
const MAX_POLL_COUNT = 24
const AIPROXY_IN_PROGRESS_STATUSES = new Set(['aiproxy_pending', 'aiproxy_syncing'])
const AIPROXY_TERMINAL_STATUSES = new Set(['ready', 'partial', 'aiproxy_partial', 'aiproxy_sync_failed'])

export default {
  name: 'LlmDeploymentAiproxyAccessPanel',
  components: { AiproxyRoutingPanel },
  mixins: [WindowsMixin, AiproxyLlmLinkListMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      default: undefined,
    },
  },
  data () {
    return {
      endpointUrl: '',
      endpointLoading: false,
      pollTimer: null,
      pollCount: 0,
      registerLoading: false,
      unregisterLoading: false,
      selectedVirtualKeyId: '',
      selectedVirtualKey: '',
      virtualKeyLoading: false,
      virtualKeyDefaultLoaded: false,
    }
  },
  computed: {
    virtualKeySelectParams () {
      return getAiproxySelectParams(this, 'ai_virtual_keys', { enabled: true })
    },
    registerMeta () {
      return getRegisterAiproxyMeta(this.data, this)
    },
    unregisterMeta () {
      return getUnregisterAiproxyMeta(this.data, this)
    },
    autoRegister () {
      return this.data?.auto_register_aiproxy !== false
    },
    aiproxyInstances () {
      return Array.isArray(this.data?.aiproxy_bindings) ? this.data.aiproxy_bindings : []
    },
    readyInstances () {
      return this.aiproxyInstances.filter(item => {
        if (!item?.client_model_alias) return false
        return item.sync_status === 'synced' || !item.sync_status
      })
    },
    syncFailed () {
      return this.data?.status === 'aiproxy_sync_failed'
    },
    waitingSync () {
      if (this.endpointLoading) return true
      const status = this.data?.status
      if (status === 'aiproxy_sync_failed') return false
      if (AIPROXY_IN_PROGRESS_STATUSES.has(status)) return true
      if (status === 'deploying' && this.autoRegister) return true
      if (AIPROXY_TERMINAL_STATUSES.has(status)) {
        if (status === 'aiproxy_sync_failed') return false
        return !this.readyInstances.length || !this.endpointUrl
      }
      return false
    },
    accessRows () {
      return this.aiproxyInstances.map(item => ({
        ...item,
        endpoint: this.endpointUrl || '',
      }))
    },
    accessColumns () {
      return [
        {
          title: this.$t('aice.aiproxy.llm_id'),
          dataIndex: 'llm_id',
          scopedSlots: { customRender: 'llm_id' },
        },
        {
          title: this.$t('aice.aiproxy.model_key'),
          dataIndex: 'client_model_alias',
          scopedSlots: { customRender: 'model' },
        },
        {
          title: this.$t('aice.aiproxy.provider'),
          dataIndex: 'ai_provider_id',
          scopedSlots: { customRender: 'provider' },
        },
        {
          title: this.$t('aice.llm_deployment.aiproxy_sync_status'),
          dataIndex: 'sync_status',
          scopedSlots: { customRender: 'sync_status' },
        },
        {
          title: this.$t('aice.llm_deployment.aiproxy_access_endpoint'),
          dataIndex: 'endpoint',
          scopedSlots: { customRender: 'endpoint' },
        },
      ]
    },
    curlExample () {
      const model = this.readyInstances[0]?.client_model_alias || 'your-model'
      return buildAiproxyCurlExample({
        endpoint: this.endpointUrl,
        model,
        virtualKey: this.selectedVirtualKey,
      })
    },
  },
  watch: {
    'data.status' () {
      this.syncPollingState()
    },
    'data.aiproxy_bindings': {
      deep: true,
      handler () {
        this.syncPollingState()
        this.loadEndpoint()
        this.enrichBindingDisplayNames()
      },
    },
    'data.aiproxy_routing_id' () {
      this.loadEndpoint()
    },
    'data.auto_register_aiproxy' () {
      if (this.data?.auto_register_aiproxy === false) {
        this.resetAccessState()
      }
    },
    waitingSync (val) {
      if (!val && this.autoRegister && !this.syncFailed) {
        this.loadDefaultVirtualKey()
      }
    },
  },
  mounted () {
    this.loadEndpoint()
    this.syncPollingState()
    this.enrichBindingDisplayNames()
    if (!this.waitingSync && this.autoRegister && !this.syncFailed) {
      this.loadDefaultVirtualKey()
    }
  },
  beforeDestroy () {
    this.stopPolling()
  },
  methods: {
    async handleRegister () {
      if (!this.onManager || !this.registerMeta.validate) return
      this.registerLoading = true
      try {
        await performLlmDeploymentRegisterAiproxy(this, this.data)
        this.pollCount = 0
        this.$bus.$emit('refresh-detail')
        this.syncPollingState()
      } finally {
        this.registerLoading = false
      }
    },
    handleUnregister () {
      if (!this.onManager || !this.unregisterMeta.validate) return
      this.createDialog('ConfirmDialog', {
        title: this.$t('aice.llm_deployment.unregister_aiproxy'),
        content: this.$t('aice.llm_deployment.unregister_aiproxy_confirm'),
        onOk: async () => {
          this.unregisterLoading = true
          try {
            await performLlmDeploymentUnregisterAiproxy(this, this.data)
            this.resetAccessState()
            await pollDeploymentDetailRefresh(
              this,
              () => this.data?.auto_register_aiproxy === false,
            )
          } finally {
            this.unregisterLoading = false
          }
        },
      })
    },
    resetAccessState () {
      this.endpointUrl = ''
      this.endpointLoading = false
      this.pollCount = 0
      this.stopPolling()
    },
    formatSyncStatus (status) {
      if (!status) return '-'
      const key = `aice.llm_deployment.aiproxy_sync_status.${status}`
      const text = this.$t(key)
      return text === key ? status : text
    },
    formatDeploymentStatus (status) {
      if (!status) return '-'
      const key = `status.llmDeployment.${status}`
      const text = this.$t(key)
      return text === key ? status : text
    },
    llmInstanceName (row) {
      return getLlmInstanceDisplayName(row, this.llmInstanceNameMap)
    },
    enrichBindingDisplayNames () {
      if (!this.aiproxyInstances.length) return
      this.enrichRowsWithAiProviderLinks({ data: { data: this.aiproxyInstances } })
      this.enrichRowsWithAiproxyLlmLinks({ data: { data: this.aiproxyInstances } }, { withInstance: true })
    },
    async onVirtualKeyChange (id) {
      if (!id) {
        this.selectedVirtualKey = ''
        return
      }
      await this.fetchVirtualKeySecret(id)
    },
    async fetchVirtualKeySecret (id) {
      if (!id) {
        this.selectedVirtualKey = ''
        return
      }
      this.virtualKeyLoading = true
      try {
        const manager = new Manager('ai_virtual_keys')
        const { data } = await manager.get({
          id,
          params: getAiproxySelectParams(this, 'ai_virtual_keys'),
        })
        this.selectedVirtualKey = data?.virtual_key || ''
      } catch (e) {
        this.selectedVirtualKey = ''
      } finally {
        this.virtualKeyLoading = false
      }
    },
    async loadDefaultVirtualKey () {
      if (this.virtualKeyDefaultLoaded || this.selectedVirtualKeyId) return
      this.virtualKeyDefaultLoaded = true
      try {
        const manager = new Manager('ai_virtual_keys')
        const { data: { data = [] } } = await manager.list({
          params: {
            ...getAiproxySelectParams(this, 'ai_virtual_keys', { enabled: true }),
            limit: 1,
          },
        })
        const first = data[0]
        if (!first?.id) return
        this.selectedVirtualKeyId = first.id
        if (first.virtual_key) {
          this.selectedVirtualKey = first.virtual_key
          return
        }
        await this.fetchVirtualKeySecret(first.id)
      } catch (e) {
        // ignore
      }
    },
    async loadEndpoint () {
      if (!this.autoRegister || this.syncFailed) {
        this.endpointUrl = ''
        return
      }
      if (!this.readyInstances.length) {
        this.endpointUrl = ''
        return
      }
      this.endpointLoading = true
      try {
        this.endpointUrl = await resolveAiproxyChatCompletionsUrl(this, {
          routingId: this.data?.aiproxy_routing_id,
        })
      } catch (e) {
        this.endpointUrl = ''
      } finally {
        this.endpointLoading = false
        this.syncPollingState()
      }
    },
    shouldPoll () {
      if (!this.autoRegister || this.syncFailed) return false
      if (this.pollCount >= MAX_POLL_COUNT) return false
      const status = this.data?.status
      if (AIPROXY_IN_PROGRESS_STATUSES.has(status)) return true
      if (status === 'deploying' && this.autoRegister) return true
      if (['ready', 'partial', 'aiproxy_partial'].includes(status)) {
        return !this.readyInstances.length || !this.endpointUrl
      }
      return false
    },
    syncPollingState () {
      if (this.shouldPoll()) {
        this.startPolling()
      } else {
        this.stopPolling()
      }
    },
    startPolling () {
      if (this.pollTimer) return
      this.pollTimer = setInterval(() => {
        this.pollCount += 1
        if (!this.shouldPoll()) {
          this.stopPolling()
          return
        }
        this.$bus.$emit('refresh-detail')
        if (this.pollCount >= MAX_POLL_COUNT) {
          this.stopPolling()
        }
      }, POLL_INTERVAL_MS)
    },
    stopPolling () {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
    },
  },
}
</script>

<style lang="less" scoped>
.aiproxy-access-panel {
  pre {
    white-space: pre-wrap;
    word-break: break-all;
  }

  .virtual-key-select {
    max-width: 480px;
  }
}
</style>

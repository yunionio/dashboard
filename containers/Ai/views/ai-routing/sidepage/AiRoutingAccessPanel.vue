<template>
  <div class="ai-routing-access-panel p-3">
    <div class="mb-3">
      <div class="mb-1">{{ $t('aice.aiproxy.access_protocol') }}</div>
      <p class="text-color-help mb-2">{{ $t('aice.aiproxy.access_protocol_hint') }}</p>
      <a-radio-group
        v-model="activeProtocol"
        button-style="solid"
        size="small">
        <a-radio-button value="openai">
          {{ $t('aice.aiproxy.protocol.openai') }}
        </a-radio-button>
        <a-radio-button value="anthropic">
          {{ $t('aice.aiproxy.protocol.anthropic') }}
        </a-radio-button>
      </a-radio-group>
    </div>
    <p class="text-color-help mb-2">{{ $t('aice.aiproxy.routing_access_hint') }}</p>
    <div class="mb-3">
      <div class="mb-1">{{ $t('aice.llm_deployment.aiproxy_access_select_vk') }}</div>
      <div class="d-flex align-items-center">
        <base-select
          v-model="selectedVirtualKeyId"
          resource="ai_virtual_keys"
          :params="virtualKeySelectParams"
          :extra-opts="virtualKeyExtraOpts"
          filterable
          version="v2"
          allow-clear
          class="virtual-key-select flex-fill"
          @change="onVirtualKeyChange" />
        <a-button
          v-if="hasConfiguredApiKey"
          type="link"
          size="small"
          class="ml-2 flex-shrink-0"
          @click="handleQuickChatTest">
          {{ $t('aice.llm_deployment.chat_test_quick') }}
        </a-button>
      </div>
    </div>
    <aiproxy-client-access-detail
      :protocol="activeProtocol"
      :openai-base-url="openaiBaseUrl"
      :anthropic-base-url="anthropicBaseUrl"
      :openai-endpoint-url="endpointUrl"
      :anthropic-messages-url="anthropicMessagesUrl"
      :virtual-key="selectedVirtualKey"
      :model="exampleModel"
      :provider-key="providerKey" />
  </div>
</template>

<script>
import { Manager } from '@/utils/manager'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import AiproxyVirtualKeySelectMixin from '@Ai/mixins/aiproxyVirtualKeySelectMixin'
import AiproxyClientAccessDetail from '@Ai/sections/AiproxyClientAccessDetail'
import {
  resolveAiproxyAnthropicBaseUrl,
  resolveAiproxyAnthropicMessagesUrl,
  resolveAiproxyChatCompletionsUrl,
  resolveAiproxyOpenAIBaseUrl,
} from '@Ai/utils/aiproxyEndpoint'

export default {
  name: 'AiRoutingAccessPanel',
  components: { AiproxyClientAccessDetail },
  mixins: [AiproxyVirtualKeySelectMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      activeProtocol: 'openai',
      endpointUrl: '',
      openaiBaseUrl: '',
      anthropicBaseUrl: '',
      anthropicMessagesUrl: '',
      endpointLoading: false,
      providerKey: '',
    }
  },
  computed: {
    routingId () {
      return this.data?.id || ''
    },
    exampleModel () {
      return this.data?.model_key || 'your-model'
    },
  },
  mounted () {
    this.loadEndpoint()
    this.loadRoutingProviderKey()
  },
  methods: {
    async loadEndpoint () {
      if (!this.routingId) {
        this.endpointUrl = ''
        this.openaiBaseUrl = ''
        this.anthropicBaseUrl = ''
        this.anthropicMessagesUrl = ''
        return
      }
      this.endpointLoading = true
      try {
        const routingId = this.routingId
        const [chatUrl, openaiBase, anthropicBase, anthropicMessages] = await Promise.all([
          resolveAiproxyChatCompletionsUrl(this, { routingId }),
          resolveAiproxyOpenAIBaseUrl(this, { routingId }),
          resolveAiproxyAnthropicBaseUrl(this, { routingId }),
          resolveAiproxyAnthropicMessagesUrl(this, { routingId }),
        ])
        this.endpointUrl = chatUrl
        this.openaiBaseUrl = openaiBase
        this.anthropicBaseUrl = anthropicBase
        this.anthropicMessagesUrl = anthropicMessages
      } catch (e) {
        this.endpointUrl = ''
        this.openaiBaseUrl = ''
        this.anthropicBaseUrl = ''
        this.anthropicMessagesUrl = ''
      } finally {
        this.endpointLoading = false
      }
    },
    async loadRoutingProviderKey () {
      if (!this.routingId) return
      try {
        const manager = new Manager('ai_routing_models')
        const { data: { data = [] } } = await manager.list({
          params: {
            ai_routing_id: this.routingId,
            scope: getAiproxyResourceScope('ai_routing_models', this),
            enabled: true,
            limit: 50,
          },
        })
        const rows = [...(data || [])].sort((a, b) => (a.priority || 0) - (b.priority || 0))
        const providerId = rows[0]?.ai_provider_id
        if (!providerId) return
        const providerManager = new Manager('ai_providers')
        const { data: provider } = await providerManager.get({
          id: providerId,
          params: { scope: getAiproxyResourceScope('ai_providers', this) },
        })
        this.providerKey = String(provider?.provider_key || '').trim().toLowerCase()
      } catch (e) {
        this.providerKey = ''
      }
    },
    handleQuickChatTest () {
      this.$bus.$emit('aiRoutingOpenChatTest', {
        routingId: this.routingId,
        virtualKeyId: this.selectedVirtualKeyId,
        virtualKey: this.selectedVirtualKey,
      })
    },
  },
}
</script>

<style lang="less" scoped>
.ai-routing-access-panel {
  .virtual-key-select {
    max-width: 480px;
  }
}
</style>

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
    <div v-if="showModelSelect" class="mb-3">
      <div class="mb-1">{{ $t('aice.aiproxy.client_model_select') }}</div>
      <a-select
        v-model="selectedClientModelId"
        class="client-model-select"
        style="width: 100%; max-width: 480px;">
        <a-select-option
          v-for="opt in clientModelOptions"
          :key="opt.id"
          :value="opt.id">
          {{ opt.id }}
          <span v-if="opt.kind === 'flat'" class="text-color-help ml-1">
            ({{ $t('aice.aiproxy.client_model_flat') }})
          </span>
        </a-select-option>
      </a-select>
      <p class="text-color-help mt-1 mb-0">{{ $t('aice.aiproxy.hierarchical_model_hint') }}</p>
    </div>
    <aiproxy-client-access-detail
      :protocol="activeProtocol"
      :openai-base-url="openaiBaseUrl"
      :anthropic-base-url="anthropicBaseUrl"
      :openai-endpoint-url="endpointUrl"
      :anthropic-messages-url="anthropicMessagesUrl"
      :virtual-key="selectedVirtualKey"
      :virtual-key-ref="selectedVirtualKeyRef"
      :model="displayModel"
      :provider-key="providerKey"
      :client-model-options="clientModelOptions"
      :routing="data"
      :routing-ref="data.name || data.id" />
  </div>
</template>

<script>
import { Manager } from '@/utils/manager'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import AiproxyVirtualKeySelectMixin from '@Ai/mixins/aiproxyVirtualKeySelectMixin'
import AiproxyClientAccessDetail from '@Ai/sections/AiproxyClientAccessDetail'
import {
  defaultClientModelOption,
  fetchRoutingClientModelOptions,
} from '@Ai/utils/aiproxyClientModelId'
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
      clientModelOptions: [],
      selectedClientModelId: '',
    }
  },
  computed: {
    routingId () {
      return this.data?.id || ''
    },
    showModelSelect () {
      return this.clientModelOptions.length > 1
    },
    displayModel () {
      if (this.selectedClientModelId) {
        return this.selectedClientModelId
      }
      return defaultClientModelOption(this.clientModelOptions) ||
        this.data?.model_key ||
        'your-model'
    },
  },
  watch: {
    routingId () {
      this.loadRoutingModels()
      this.loadEndpoint()
    },
    'data.model_key' () {
      this.loadRoutingModels()
    },
  },
  mounted () {
    this.loadEndpoint()
    this.loadRoutingModels()
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
    async loadRoutingModels () {
      if (!this.routingId) {
        this.clientModelOptions = []
        this.selectedClientModelId = ''
        this.providerKey = ''
        return
      }
      try {
        const { options } = await fetchRoutingClientModelOptions(this.routingId, this.data, this)
        this.clientModelOptions = options
        this.selectedClientModelId = defaultClientModelOption(this.clientModelOptions)

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
        if (providerId) {
          const providerManager = new Manager('ai_providers')
          const { data: provider } = await providerManager.get({
            id: providerId,
            params: { scope: getAiproxyResourceScope('ai_providers', this) },
          })
          this.providerKey = String(provider?.provider_key || '').trim().toLowerCase()
        } else {
          this.providerKey = ''
        }
      } catch (e) {
        this.clientModelOptions = []
        this.selectedClientModelId = this.data?.model_key || ''
        this.providerKey = ''
      }
    },
    handleQuickChatTest () {
      this.$bus.$emit('aiRoutingOpenChatTest', {
        routingId: this.routingId,
        virtualKeyId: this.selectedVirtualKeyId,
        virtualKey: this.selectedVirtualKey,
        clientModel: this.displayModel,
      })
    },
  },
}
</script>

<style lang="less" scoped>
.ai-routing-access-panel {
  .virtual-key-select,
  .client-model-select {
    max-width: 480px;
  }
}
</style>

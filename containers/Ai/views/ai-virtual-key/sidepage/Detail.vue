<template>
  <div>
    <detail :onManager="onManager" :data="data" :base-info="baseInfo" resource="ai_virtual_keys" />
    <a-divider orientation="left">{{ $t('aice.aiproxy.endpoint_hint') }}</a-divider>
    <p class="text-color-help mb-2">{{ $t('aice.aiproxy.virtual_key_dual_protocol_hint') }}</p>
    <a-tabs v-model="curlProtocol" size="small">
      <a-tab-pane key="openai" :tab="$t('aice.aiproxy.protocol.openai')">
        <a-alert type="info" show-icon>
          <template slot="message">{{ $t('aice.aiproxy.endpoint_example') }}</template>
          <template slot="description">
            <div class="access-code-block">
              <copy class="access-code-copy" :message="openaiCurlExample" />
              <pre class="mb-0 access-code">{{ openaiCurlExample }}</pre>
            </div>
          </template>
        </a-alert>
      </a-tab-pane>
      <a-tab-pane key="anthropic" :tab="$t('aice.aiproxy.protocol.anthropic')">
        <a-alert type="info" show-icon>
          <template slot="message">{{ $t('aice.aiproxy.endpoint_example') }}</template>
          <template slot="description">
            <p class="text-color-help mb-2">{{ $t('aice.aiproxy.anthropic_base_url_hint') }}</p>
            <div class="access-code-block">
              <copy class="access-code-copy" :message="anthropicCurlExample" />
              <pre class="mb-0 access-code">{{ anthropicCurlExample }}</pre>
            </div>
          </template>
        </a-alert>
        <a-alert type="info" show-icon class="mt-2">
          <template slot="message">{{ $t('aice.aiproxy.claude_code_config_title') }}</template>
          <template slot="description">
            <div class="access-code-block">
              <copy class="access-code-copy" :message="claudeCodeEnvExample" />
              <pre class="mb-0 access-code">{{ claudeCodeEnvExample }}</pre>
            </div>
          </template>
        </a-alert>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { getEnabledTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import {
  buildAiproxyCurlExample,
  buildAnthropicCurlExample,
  buildAnthropicMessagesUrl,
  buildChatCompletionsUrl,
  buildClaudeCodeEnvExample,
  resolveAiproxyBaseUrl,
} from '@Ai/utils/aiproxyEndpoint'
import { maskSecret } from '@Ai/utils/aiproxyUtils'

export default {
  name: 'AiVirtualKeyDetail',
  props: {
    data: { type: Object, required: true },
    onManager: { type: Function, required: true },
  },
  data () {
    return {
      curlProtocol: 'openai',
      endpointBase: '',
      exampleModel: 'your-model',
    }
  },
  computed: {
    baseInfo () {
      return [
        getEnabledTableColumn(),
        {
          field: 'virtual_key',
          title: this.$t('aice.aiproxy.virtual_key_field'),
          slots: {
            default: ({ row }) => [
              <span>{maskSecret(row.virtual_key)}</span>,
              <copy class="ml-1" message={row.virtual_key} />,
            ],
          },
        },
        { field: 'owner_name', title: this.$t('aice.aiproxy.owner') },
        {
          field: 'limits.max_tokens_per_request',
          title: this.$t('aice.aiproxy.max_tokens_per_request'),
          formatter: ({ row }) => row.limits?.max_tokens_per_request || '-',
        },
        {
          field: 'limits.requests_per_minute',
          title: this.$t('aice.aiproxy.requests_per_minute'),
          formatter: ({ row }) => row.limits?.requests_per_minute || '-',
        },
        {
          field: 'limits.allowed_ai_provider_ids',
          title: this.$t('aice.aiproxy.allowed_ai_provider_ids'),
          formatter: ({ row }) => (row.limits?.allowed_ai_provider_ids || []).join(', ') || '-',
        },
        getProjectTableColumn(),
        getTimeTableColumn(),
      ]
    },
    virtualKey () {
      return this.data.virtual_key || '<virtual_key>'
    },
    openaiCurlExample () {
      const endpoint = this.endpointBase
        ? buildChatCompletionsUrl(this.endpointBase)
        : '<endpoint>/ai/openai/v1/chat/completions'
      return buildAiproxyCurlExample({
        endpoint,
        model: this.exampleModel,
        virtualKey: this.virtualKey,
      })
    },
    anthropicCurlExample () {
      const endpoint = this.endpointBase
        ? buildAnthropicMessagesUrl(this.endpointBase)
        : '<endpoint>/ai/anthropic/v1/messages'
      return buildAnthropicCurlExample({
        endpoint,
        model: this.exampleModel,
        virtualKey: this.virtualKey,
      })
    },
    claudeCodeEnvExample () {
      return buildClaudeCodeEnvExample({
        anthropicBaseUrl: this.endpointBase
          ? `${this.endpointBase.replace(/\/+$/, '')}/ai/anthropic`
          : '',
        virtualKey: this.virtualKey,
        model: this.exampleModel,
      })
    },
  },
  mounted () {
    this.loadEndpoint()
  },
  methods: {
    async loadEndpoint () {
      try {
        this.endpointBase = await resolveAiproxyBaseUrl(this)
      } catch (e) {
        this.endpointBase = ''
      }
    },
  },
}
</script>

<style lang="less" scoped>
.access-code-block {
  position: relative;
  padding-right: 28px;

  .access-code-copy {
    position: absolute;
    top: 0;
    right: 0;
    line-height: 1;
  }
}

.access-code {
  white-space: pre-wrap;
  word-break: break-all;
  background: transparent;
}
</style>

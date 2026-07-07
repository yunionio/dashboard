<template>
  <a-card size="small" class="aiproxy-client-access-detail mt-3">
    <div slot="title">{{ $t('aice.aiproxy.access_protocol_detail') }}</div>
    <template v-if="protocol === 'anthropic' && anthropicBlocked">
      <a-alert type="warning" show-icon>
        <template slot="message">{{ $t('aice.aiproxy.provider_client_hint.anthropic_unsupported') }}</template>
      </a-alert>
    </template>
    <template v-else>
      <a-alert
        v-if="clientHintKey"
        type="info"
        show-icon
        class="mb-3">
        <template slot="message">{{ $t('aice.aiproxy.provider_client_hint.title') }}</template>
        <template slot="description">
          <p class="mb-0">{{ $t(clientHintKey, { model: displayModel }) }}</p>
        </template>
      </a-alert>
      <p
        v-if="protocol === 'anthropic'"
        class="text-color-help mb-3">
        {{ $t('aice.aiproxy.anthropic_base_url_hint') }}
      </p>
      <div
        v-for="field in fields"
        :key="field.id"
        class="access-field-row">
        <div class="access-field-label">
          <a-icon v-if="field.icon" :type="field.icon" class="mr-1" />
          <span>{{ $t(field.labelKey) }}</span>
        </div>
        <a-input-group compact class="access-field-control">
          <a-input
            :value="fieldValue(field)"
            read-only
            class="access-field-value"
            :class="{ 'is-placeholder': isPlaceholder(field) }" />
          <a-tooltip :title="$t('common.copy')">
            <a-button
              icon="copy"
              :disabled="!canCopy(field)"
              @click="copyField(field)" />
          </a-tooltip>
        </a-input-group>
      </div>
      <a-alert type="info" show-icon class="mb-2 access-code-alert">
        <template slot="message">{{ $t('aice.aiproxy.endpoint_example') }}</template>
        <template slot="description">
          <div class="access-code-block">
            <copy class="access-code-copy" :message="curlExample" />
            <pre class="mb-0 access-code">{{ curlExample }}</pre>
          </div>
        </template>
      </a-alert>
      <a-alert
        v-if="protocol === 'anthropic'"
        type="info"
        show-icon
        class="access-code-alert">
        <template slot="message">{{ $t('aice.aiproxy.claude_code_config_title') }}</template>
        <template slot="description">
          <div class="access-code-block">
            <copy class="access-code-copy" :message="claudeCodeEnvExample" />
            <pre class="mb-0 access-code">{{ claudeCodeEnvExample }}</pre>
          </div>
        </template>
      </a-alert>
    </template>
  </a-card>
</template>

<script>
import {
  getAgentAccessFields,
  getProviderClientHintKey,
  isAnthropicProtocolBlocked,
  resolveAgentAccessFieldValue,
} from '@Ai/constants/agentAiproxyAccessConfig'
import {
  buildAiproxyCurlExample,
  buildAnthropicCurlExample,
  buildClaudeCodeEnvExample,
  isPlaceholderApiKey,
} from '@Ai/utils/aiproxyEndpoint'
import { copyText } from '@Ai/utils/aiproxyUtils'

export default {
  name: 'AiproxyClientAccessDetail',
  props: {
    protocol: {
      type: String,
      default: 'openai',
      validator: v => ['openai', 'anthropic'].includes(v),
    },
    openaiBaseUrl: {
      type: String,
      default: '',
    },
    anthropicBaseUrl: {
      type: String,
      default: '',
    },
    openaiEndpointUrl: {
      type: String,
      default: '',
    },
    anthropicMessagesUrl: {
      type: String,
      default: '',
    },
    virtualKey: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: '',
    },
    providerKey: {
      type: String,
      default: '',
    },
  },
  computed: {
    displayModel () {
      return this.model || 'your-model'
    },
    anthropicBlocked () {
      return isAnthropicProtocolBlocked(this.providerKey)
    },
    clientHintKey () {
      return getProviderClientHintKey(this.providerKey, this.protocol)
    },
    fields () {
      return getAgentAccessFields(this.protocol)
    },
    valueContext () {
      return {
        protocol: this.protocol,
        baseUrl: this.openaiBaseUrl,
        anthropicBaseUrl: this.anthropicBaseUrl,
        apiKey: this.virtualKey,
        model: this.model,
      }
    },
    curlExample () {
      if (this.protocol === 'anthropic') {
        return buildAnthropicCurlExample({
          endpoint: this.anthropicMessagesUrl,
          model: this.displayModel,
          virtualKey: this.virtualKey,
        })
      }
      return buildAiproxyCurlExample({
        endpoint: this.openaiEndpointUrl,
        model: this.displayModel,
        virtualKey: this.virtualKey,
      })
    },
    claudeCodeEnvExample () {
      return buildClaudeCodeEnvExample({
        anthropicBaseUrl: this.anthropicBaseUrl,
        virtualKey: this.virtualKey,
        model: this.displayModel,
      })
    },
  },
  methods: {
    fieldValue (field) {
      return resolveAgentAccessFieldValue(field.valueKey, this.valueContext)
    },
    isPlaceholder (field) {
      const value = this.fieldValue(field)
      if (field.valueKey === 'apiKey') {
        return isPlaceholderApiKey(value)
      }
      if (field.valueKey === 'model') {
        return !this.model
      }
      return !value
    },
    canCopy (field) {
      return !!String(this.fieldValue(field) || '').trim()
    },
    copyField (field) {
      copyText(this, this.fieldValue(field))
    },
  },
}
</script>

<style lang="less" scoped>
.aiproxy-client-access-detail {
  .access-field-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  .access-field-label {
    display: flex;
    align-items: center;
    width: 140px;
    flex-shrink: 0;
    font-size: 13px;
    color: var(--color-text-2, rgba(0, 0, 0, 0.65));
  }

  .access-field-control {
    flex: 1;
    min-width: 0;
    display: flex !important;
  }

  .access-field-value {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 13px;

    &.is-placeholder {
      color: var(--color-text-3, rgba(0, 0, 0, 0.45));
    }
  }

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
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 12px;
    background: transparent;
  }

  @media (max-width: 576px) {
    .access-field-row {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }

    .access-field-label {
      width: auto;
    }
  }
}
</style>

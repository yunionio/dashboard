<template>
  <a-card size="small" class="aiproxy-client-access-detail mt-3">
    <div slot="title">{{ $t('aice.aiproxy.access_protocol_detail') }}</div>
    <template v-if="protocol === 'anthropic' && anthropicBlocked">
      <a-alert type="warning" show-icon>
        <template slot="message">{{ $t('aice.aiproxy.provider_client_hint.anthropic_unsupported') }}</template>
      </a-alert>
    </template>
    <template v-else>
      <a-tabs v-model="activeDetailTab" size="small" class="access-detail-tabs">
        <a-tab-pane key="access" :tab="$t('aice.aiproxy.access_detail_tab_access')">
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
          <div class="access-example-section">
            <div class="access-example-title mb-2">{{ $t('aice.aiproxy.endpoint_example') }}</div>
            <div class="access-code-block access-code-block--panel">
              <copy class="access-code-copy" :message="curlExample" />
              <pre class="mb-0 access-code">{{ curlExample }}</pre>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane
          v-if="showAgentCliTab"
          key="agent-cli"
          :tab="agentCliTabLabel">
          <div class="agent-cli-pane">
            <template v-if="protocol === 'openai'">
              <a-alert type="info" show-icon class="mb-3">
                <template slot="message">{{ $t('aice.aiproxy.codex_config_title') }}</template>
                <template slot="description">
                  <p class="mb-0">{{ $t('aice.aiproxy.codex_config_hint') }}</p>
                </template>
              </a-alert>
              <div class="access-code-block access-code-block--panel">
                <copy class="access-code-copy" :message="codexClimcExample" />
                <pre class="mb-0 access-code access-shell-script">
                  <span
                    v-for="(line, index) in codexScriptLines"
                    :key="index"
                    class="access-shell-line"
                    :class="{ 'access-shell-comment': line.type === 'comment' }">{{ line.text }}{{ index !== codexScriptLines.length - 1 ? '\n' : '' }}</span>
                </pre>
              </div>
            </template>
            <template v-else-if="protocol === 'anthropic'">
              <template v-if="showClaudeModelMapping">
                <a-alert type="info" show-icon class="mb-3">
                  <template slot="message">{{ $t('aice.aiproxy.claude_code_model_mapping') }}</template>
                  <template slot="description">
                    <p class="mb-0">{{ $t('aice.aiproxy.claude_code_model_mapping_hint') }}</p>
                  </template>
                </a-alert>
                <div class="claude-env-mapping claude-env-mapping--panel mb-3">
                  <div
                    v-for="field in claudeEnvModelFields"
                    :key="field.key"
                    class="claude-env-row">
                    <div class="claude-env-label">{{ $t(field.labelKey) }}</div>
                    <a-select
                      v-model="claudeEnvSelections[field.key]"
                      class="claude-env-select"
                      style="width: 100%;">
                      <a-select-option
                        v-for="opt in clientModelOptions"
                        :key="opt.id"
                        :value="opt.id">
                        {{ opt.id }}
                      </a-select-option>
                    </a-select>
                  </div>
                </div>
                <a-alert type="info" show-icon class="mb-3">
                  <template slot="message">{{ $t('aice.aiproxy.claude_code_config_title') }}</template>
                  <template slot="description">
                    <p class="mb-0">{{ $t('aice.aiproxy.claude_code_config_hint') }}</p>
                  </template>
                </a-alert>
              </template>
              <div class="access-code-block access-code-block--panel">
                <copy class="access-code-copy" :message="claudeCodeEnvExample" />
                <pre class="mb-0 access-code">{{ claudeCodeEnvExample }}</pre>
              </div>
            </template>
          </div>
        </a-tab-pane>
      </a-tabs>
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
  CLAUDE_CODE_ENV_MODEL_FIELDS,
  defaultClaudeEnvModelSelections,
} from '@Ai/utils/aiproxyClientModelId'
import {
  buildAiproxyCurlExample,
  buildAnthropicCurlExample,
  buildClaudeCodeEnvExample,
  buildCodexClimcExample,
  isPlaceholderApiKey,
  parseShellScriptLines,
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
    virtualKeyRef: {
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
    clientModelOptions: {
      type: Array,
      default: () => [],
    },
    routing: {
      type: Object,
      default: () => ({}),
    },
    routingRef: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      activeDetailTab: 'access',
      claudeEnvSelections: defaultClaudeEnvModelSelections(),
    }
  },
  computed: {
    showAgentCliTab () {
      return !this.anthropicBlocked
    },
    agentCliTabLabel () {
      if (this.protocol === 'anthropic') {
        return this.$t('aice.aiproxy.claude_code_config_title')
      }
      return this.$t('aice.aiproxy.codex_config_title')
    },
    claudeEnvModelFields () {
      return CLAUDE_CODE_ENV_MODEL_FIELDS
    },
    showClaudeModelMapping () {
      return this.protocol === 'anthropic' && this.clientModelOptions.length > 1
    },
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
      const env = this.showClaudeModelMapping
        ? this.claudeEnvSelections
        : defaultClaudeEnvModelSelections({
          options: this.clientModelOptions,
          selectedModel: this.displayModel,
          routing: this.routing,
        })
      return buildClaudeCodeEnvExample({
        anthropicBaseUrl: this.anthropicBaseUrl,
        virtualKey: this.virtualKey,
        model: env.model || this.displayModel,
        opusModel: env.opusModel,
        sonnetModel: env.sonnetModel,
        haikuModel: env.haikuModel,
        subagentModel: env.subagentModel,
      })
    },
    codexClimcExample () {
      return buildCodexClimcExample({
        virtualKeyRef: this.virtualKeyRef,
        model: this.displayModel,
        routingRef: this.routingRef,
        comments: {
          homeDir: this.$t('aice.aiproxy.codex_cmd_comment.home_dir'),
          mkdir: this.$t('aice.aiproxy.codex_cmd_comment.mkdir'),
          climc: this.$t('aice.aiproxy.codex_cmd_comment.climc'),
          launch: this.$t('aice.aiproxy.codex_cmd_comment.launch'),
        },
      })
    },
    codexScriptLines () {
      return parseShellScriptLines(this.codexClimcExample)
    },
  },
  watch: {
    protocol () {
      this.activeDetailTab = 'access'
    },
    clientModelOptions: {
      handler () {
        this.resetClaudeEnvSelections()
      },
      deep: true,
    },
    routing: {
      handler () {
        this.resetClaudeEnvSelections()
      },
      deep: true,
    },
    model (val) {
      if (!this.showClaudeModelMapping) return
      const next = String(val || '').trim()
      if (next) {
        this.claudeEnvSelections.model = next
      }
    },
  },
  methods: {
    resetClaudeEnvSelections () {
      this.claudeEnvSelections = defaultClaudeEnvModelSelections({
        options: this.clientModelOptions,
        selectedModel: this.model,
        routing: this.routing,
      })
    },
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
  .access-detail-tabs {
    margin-top: -4px;
  }

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

  .access-example-section {
    margin-top: 16px;
  }

  .access-example-title {
    font-weight: 500;
    font-size: 13px;
    color: var(--color-text-1, rgba(0, 0, 0, 0.85));
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

  .agent-cli-pane {
    padding-top: 4px;
  }

  .access-code-block--panel {
    padding: 12px 36px 12px 16px;
    background: var(--color-fill-2, #f6f8fa);
    border: 1px solid var(--color-border, #e8e8e8);
    border-radius: 6px;

    .access-code-copy {
      top: 8px;
      right: 8px;
    }

    .access-code {
      color: var(--color-text-1, #24292f);
      margin: 0;
    }

    .access-shell-script {
      .access-shell-line {
        display: block;
      }

      .access-shell-comment {
        color: var(--color-text-3, #6a737d);
      }
    }
  }

  .claude-env-mapping--panel {
    padding: 12px 16px;
    background: var(--color-fill-2, #f6f8fa);
    border: 1px solid var(--color-border, #e8e8e8);
    border-radius: 6px;
  }

  .claude-env-mapping-title {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .claude-env-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .claude-env-label {
    width: 240px;
    flex-shrink: 0;
    font-size: 12px;
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    color: var(--color-text-2, rgba(0, 0, 0, 0.65));
  }

  .claude-env-select {
    flex: 1;
    min-width: 0;
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

    .claude-env-row {
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
    }

    .claude-env-label {
      width: auto;
    }
  }
}
</style>

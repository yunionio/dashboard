<template>
  <a-card size="small" class="agent-aiproxy-access-section mt-3">
    <div slot="title">{{ $t('aice.llm_deployment.agent_access') }}</div>
    <p class="agent-access-hint text-color-help mb-3">
      {{ $t('aice.llm_deployment.agent_access_hint') }}
    </p>
    <div
      v-for="field in fields"
      :key="field.id"
      class="agent-access-row">
      <div class="agent-access-row-label">
        <a-icon v-if="field.icon" :type="field.icon" class="mr-1" />
        <span>{{ $t(field.labelKey) }}</span>
      </div>
      <a-input-group compact class="agent-access-row-control">
        <a-input
          :value="fieldValue(field)"
          read-only
          class="agent-access-value-input"
          :class="{ 'is-placeholder': isPlaceholder(field) }" />
        <a-tooltip :title="$t('common.copy')">
          <a-button
            icon="copy"
            :disabled="!canCopy(field)"
            @click="copyField(field)" />
        </a-tooltip>
      </a-input-group>
    </div>
  </a-card>
</template>

<script>
import {
  AGENT_AIPROXY_ACCESS_FIELDS,
  resolveAgentAccessFieldValue,
} from '@Ai/constants/agentAiproxyAccessConfig'
import { isPlaceholderApiKey } from '@Ai/utils/aiproxyEndpoint'
import { copyText } from '@Ai/utils/aiproxyUtils'

export default {
  name: 'AgentAiproxyAccessSection',
  props: {
    openaiBaseUrl: {
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
  },
  computed: {
    fields () {
      return AGENT_AIPROXY_ACCESS_FIELDS
    },
    valueContext () {
      return {
        baseUrl: this.openaiBaseUrl,
        apiKey: this.virtualKey,
        model: this.model,
      }
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
.agent-aiproxy-access-section {
  .agent-access-hint {
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .agent-access-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .agent-access-row-label {
    display: flex;
    align-items: center;
    width: 96px;
    flex-shrink: 0;
    font-size: 13px;
    color: var(--color-text-2, rgba(0, 0, 0, 0.65));
  }

  .agent-access-row-control {
    flex: 1;
    min-width: 0;
    display: flex !important;
  }

  .agent-access-value-input {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 13px;

    &.is-placeholder {
      color: var(--color-text-3, rgba(0, 0, 0, 0.45));
    }
  }

  @media (max-width: 576px) {
    .agent-access-row {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }

    .agent-access-row-label {
      width: auto;
    }
  }
}
</style>

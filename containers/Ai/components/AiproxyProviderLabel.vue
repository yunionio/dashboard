<template>
  <span class="aiproxy-provider-label">
    <aiproxy-provider-icon :provider-key="providerKey" :size="iconSize" class="aiproxy-provider-label__icon" />
    <span class="aiproxy-provider-label__text">{{ displayLabel }}</span>
  </span>
</template>

<script>
import AiproxyProviderIcon from '@Ai/components/AiproxyProviderIcon'

export default {
  name: 'AiproxyProviderLabel',
  components: { AiproxyProviderIcon },
  props: {
    providerKey: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    iconSize: {
      type: Number,
      default: 18,
    },
    /** When true, show resource name (label) instead of provider_key i18n branding. */
    preferLabel: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    displayLabel () {
      const key = String(this.providerKey || '').trim()
      const text = String(this.label || '').trim()
      if (this.preferLabel) {
        if (text) return text
        if (key) {
          const i18nKey = `aice.aiproxy.provider_key.${key}`
          if (this.$te(i18nKey)) return this.$t(i18nKey)
        }
        return key || '-'
      }
      if (key) {
        const i18nKey = `aice.aiproxy.provider_key.${key}`
        if (this.$te(i18nKey)) return this.$t(i18nKey)
      }
      if (text) return text
      return key || '-'
    },
  },
}
</script>

<style lang="less" scoped>
.aiproxy-provider-label {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
}
.aiproxy-provider-label__icon {
  margin-right: 6px;
}
.aiproxy-provider-label__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

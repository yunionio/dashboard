<template>
  <span class="aiproxy-provider-icon" :style="wrapStyle">
    <img
      v-if="iconUrl"
      :src="iconUrl"
      :alt="providerKey"
      class="aiproxy-provider-icon__img"
      :style="imgStyle" />
    <span
      v-else
      class="aiproxy-provider-icon__fallback"
      :style="imgStyle"
      :title="providerKey">
      {{ fallbackLabel }}
    </span>
  </span>
</template>

<script>
import { getAiproxyProviderIcon, getAiproxyProviderIconLabel } from '@Ai/utils/aiproxyProviderIcon'

export default {
  name: 'AiproxyProviderIcon',
  props: {
    providerKey: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 18,
    },
  },
  computed: {
    iconUrl () {
      return getAiproxyProviderIcon(this.providerKey)
    },
    fallbackLabel () {
      return getAiproxyProviderIconLabel(this.providerKey)
    },
    imgStyle () {
      const px = `${this.size}px`
      return { width: px, height: px }
    },
    wrapStyle () {
      return { lineHeight: `${this.size}px` }
    },
  },
}
</script>

<style lang="less" scoped>
.aiproxy-provider-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
}
.aiproxy-provider-icon__img {
  object-fit: contain;
  border-radius: 4px;
  background: #fafafa;
}
.aiproxy-provider-icon__fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #f0f1f5;
  color: #666;
  font-size: 10px;
  font-weight: 600;
}
</style>

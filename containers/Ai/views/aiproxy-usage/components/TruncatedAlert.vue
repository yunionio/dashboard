<template>
  <a-alert
    v-if="visible"
    class="mb-3"
    type="warning"
    show-icon
    :message="$t('aice.aiproxy.usage.truncated_title')"
    :description="$t('aice.aiproxy.usage.truncated_desc')" />
</template>

<script>
export default {
  name: 'AiproxyUsageTruncatedAlert',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

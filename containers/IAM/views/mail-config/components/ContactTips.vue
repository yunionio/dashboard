<template>
  <a-alert type="warning" class="mb-2">
    <template slot="message">
      <span>{{ before }}</span>
      <help-link :href="href">{{ hrefText }}</help-link>
      <span>{{ after }}</span>
    </template>
  </a-alert>
</template>

<script>
export default {
  name: 'ContactTips',
  props: {
    before: {
      type: String,
    },
    after: {
      type: String,
    },
    href: {
      type: String,
    },
    hrefText: {
      type: String,
    },
  },
}
</script>

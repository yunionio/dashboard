<template>
  <a-button :disabled="disabled || loading" @click="refresh">
    <a-icon v-if="loading" type="sync" spin />
    <a-icon v-else type="sync" />
  </a-button>
</template>

<script>
export default {
  name: 'PageListRefreshButton',
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    disabled: {
      type: Boolean,
    },
  },
  methods: {
    refresh () {
      this.$emit('refresh')
    },
  },
}
</script>

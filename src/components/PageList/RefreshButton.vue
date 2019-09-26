<template>
  <a-button :disable="loading" @click="refresh">
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
  },
  methods: {
    refresh () {
      this.$emit('refresh')
    },
  },
}
</script>

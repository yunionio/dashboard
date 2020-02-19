<template>
  <a @click="clickHandle" v-if="inList"><slot /></a>
  <span v-else><slot /></span>
</template>

<script>
export default {
  name: 'SidePageTrigger',
  inject: {
    // 是否处于SidePage中
    inList: {
      default: false,
    },
  },
  methods: {
    clickHandle () {
      this.$emit('trigger')
    },
  },
}
</script>

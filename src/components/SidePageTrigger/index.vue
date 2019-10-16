<template>
  <a @click="clickHandle"><slot /></a>
</template>

<script>
export default {
  name: 'SidePageTrigger',
  methods: {
    clickHandle () {
      this.$emit('trigger')
    },
  },
}
</script>

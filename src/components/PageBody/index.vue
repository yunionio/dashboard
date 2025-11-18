<template>
  <div class="page-body" :style="`padding-bottom:${needMarginBottom ? '74px' : ''}`">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'PageBody',
  props: {
    needMarginBottom: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="less" scoped>
.page-body {
  margin-top: 20px;
}
</style>

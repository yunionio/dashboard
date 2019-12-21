<template>
  <div class="page-footer p-3 bg-white">
    <div class="page-footer_inner d-flex h-100">
      <template v-if="hasDefaultSlot">
        <div class="d-flex justify-content-end align-items-center"><slot /></div>
      </template>
      <template v-else>
        <div class="d-flex flex-fill align-items-center"><slot name="left" /></div>
        <div class="d-flex align-items-center"><slot name="right" /></div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageFooter',
  inheritAttrs: false,
  computed: {
    hasDefaultSlot () {
      return !!this.$slots.default
    },
  },
}
</script>

<style lang="scss" scoped>
.page-footer {
  z-index: 10;
  position: fixed;
  bottom: 0;
  left: 224px;
  right: 0;
  height: 74px;
  box-shadow: 0 -2px 4px 0 rgba(237, 237, 237, 0.5), 0 -2px 4px 0 rgba(237, 237, 237, 0.5);
}
</style>

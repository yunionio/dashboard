<template>
  <div class="page-footer p-3 bg-white">
    <div class="page-footer_inner">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageFooter',
  inheritAttrs: false,
}
</script>

<style lang="scss" scoped>
.page-footer {
  z-index: 1;
  position: fixed;
  bottom: 0;
  left: 224px;
  right: 0;
  box-shadow: 0 -2px 4px 0 rgba(237, 237, 237, 0.5), 0 -2px 4px 0 rgba(237, 237, 237, 0.5);
}
</style>

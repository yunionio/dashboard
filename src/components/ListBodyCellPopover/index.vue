<template>
  <a-popover trigger="hover">
    <div slot="content" class="list-body-cell-popover-container" :style="containerStyle">
      <slot />
    </div>
    <span class="list-body-cell-popover-text">{{ text }}</span>
  </a-popover>
</template>

<script>
export default {
  name: 'ListBodyCellPopover',
  props: {
    text: {
      type: String,
      required: true,
    },
    minWidth: {
      type: String,
    },
    maxWidth: {
      type: String,
    },
  },
  computed: {
    containerStyle () {
      const ret = {}
      if (this.minWidth) {
        ret.minWidth = this.minWidth
      }
      if (this.maxWidth) {
        ret.maxWidth = this.maxWidth
      }
      return ret
    },
  },
}
</script>

<style lang="scss" scoped>
.sharing-rules-popover {
  max-width: 80vw;
  display: block;
  :deep(.vxe-body--column) {
    white-space: normal !important;
    word-break: break-word;
  }
  .vxe-grid {
    width: 100%;
  }
}
.list-body-cell-popover-text {
  color: var(--antd-wave-shadow-color);
}
</style>

<template>
  <div :class="formWrap">
    <div class="page-footer p-3 bg-white" :style="pageFooterStyle">
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
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PageFooter',
  inheritAttrs: false,
  props: {
    isForm: {
      type: Boolean,
      default: false,
    },
    footerStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    ...mapState({
      setting: state => state.setting,
    }),
    ...mapState('common', {
      cloudShellHeight: state => state.openCloudShell ? state.cloudShellHeight : 0,
    }),
    hasDefaultSlot () {
      return !!this.$slots.default
    },
    formWrap () {
      if (this.isForm) {
        return 'form-page-wrap'
      } else {
        return ''
      }
    },
    l2MenuVisibleForStore () {
      return this.setting?.l2MenuVisible
    },
    pageFooterStyle () {
      if (!this.l2MenuVisibleForStore) {
        return { left: 0, ...this.footerStyle, bottom: `${this.cloudShellHeight}px` }
      }
      return { ...this.footerStyle, bottom: `${this.cloudShellHeight}px` }
    },
  },
}
</script>

<style lang="less" scoped>
.form-page-wrap {
  position: relative;
  font-size: 12px;
  height: 74px;
}

.page-footer {
  z-index: 10;
  position: fixed;
  left: 160px;
  right: 0;
  height: 74px;
  box-shadow: 0 -2px 4px 0 rgba(237, 237, 237, 0.5), 0 -2px 4px 0 rgba(237, 237, 237, 0.5);
}
</style>

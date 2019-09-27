<template>
  <div class="page-header" :class="title ? ['d-flex', 'align-items-center'] : []">
    <h3 v-if="title">{{ title }}</h3>
    <div class="mini-title mb-2" v-if="miniTitle">
      {{ miniTitle }}
    </div>
    <div class="ml-4" :class="$slots.default ? ['pt-1', 'pb-3'] : []">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  props: {
    title: {
      type: String,
    },
    miniTitle: {
      type: String,
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../src/styles/antd/index.less';

.page-header {
  min-height: 60px;
  padding: 0 20px;
  position: relative;
  > h3 {
    font-size: 20px;
    color: #1a2736;
    margin: 0;
    padding: 0;
    font-weight: normal;
  }
  &::before {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    content: "";
    box-shadow: inset 0 -1px 0 0 @border-color-base;
    opacity: .3;
  }
  .mini-title {
    font-size: 12px;
    color: @text-color-secondary;
  }
}
</style>

<template>
  <div :class="`profix-wrapper d-flex ${className}`">
    <div class="profix-label">{{label}}</div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'FixedLabelFilter',
  props: {
    label: String,
    class: String,
  },
  computed: {
    className () {
      return this.class
    },
  },
}
</script>

<style lang="less" scoped>
.profix-wrapper {
  align-items: center;
  .profix-label {
    border-left: 1px solid #d9d9d9;
    border-top: 1px solid #d9d9d9;
    border-bottom: 1px solid #d9d9d9;
    line-height: 30px;
    padding: 0 10px;
    background: #f2f1f1;
    min-width: fit-content;
    height: 32px;
  }
}
</style>

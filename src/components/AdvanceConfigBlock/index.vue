<template>
  <div class="advance-config-block">
    <div class="advance-config-block__title">{{ displayTitle }}</div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'AdvanceConfigBlock',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  computed: {
    displayTitle () {
      return this.title || this.$t('common.adv_config')
    },
  },
}
</script>

<style lang="less">
.advance-config-block {
  position: relative;
  margin: 32px 0 20px;
  padding: 30px 20px;
  background: #f9f9f9;
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.015);

  &__title {
    position: absolute;
    top: 0;
    left: 20px;
    z-index: 1;
    transform: translateY(-50%);
    padding: 0 8px;
    background: linear-gradient(180deg, #fff 0%, #f9f9f9 100%);
    border-radius: 4px 4px 0 0;
    color: var(--antd-wave-shadow-color);
    font-size: 16px;
    font-weight: 600;
    line-height: 26px;
  }
}
</style>

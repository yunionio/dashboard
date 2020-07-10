<template>
  <div
    :class="fullscreen ? 'oc-mask-fullscreen' : 'oc-mask'"
    :style="{
      background: 'rgba(' + background + ')',
      fontSize: fontSize + 'px',
      color: color
    }">
    <a-icon type="loading" class="mb-2" />
    <span>{{ text }}</span>
  </div>
</template>

<script>

export default {
  name: 'LoadingMask',
  data () {
    return {
      fullscreen: false,
      background: '255, 255, 255, 1',
      text: '加载中…',
      iconSrc: null,
      iconWidth: null,
      iconHeight: null,
      color: null,
      fontSize: null,
    }
  },
  beforeCreate () {},
  created () {},
  beforeMount () {},
  mounted () {
    if (this.fullscreen) {
      document.body.style.overflow = 'hidden'
    }
  },
  beforeUpdate () {},
  updated () {},
  activated () {},
  deactivated () {},
  beforeDestroy () {},
  destroyed () {
    document.body.style.overflowX = 'hidden'
  },
  errorCaptured () {},
  methods: {},
}
</script>

<style lang="less">
@import '../../styles/less/theme';

.oc-mask {
  position: absolute;
  z-index: 3000;
  top: 0;
  background: rgba(255, 255, 255, 1);
  width: 100%;
  height: 100%;
  color: @primary-color;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  flex-flow: column;
}
.oc-mask-fullscreen {
  &:extend(.oc-mask);
  width: 100vw;
  height: 100vh;
  top: 0;
  background: rgba(0, 0, 0, 0.5);
}
</style>

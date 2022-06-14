<template>
  <div class="grid-shadow-wrap">
    <!-- <div class="resolutionguide tips-3840x2160" /> -->
    <!-- <div class="resolutionguide tips-1920x1080" />
    <div class="resolutionguide tips-1440x900" />
    <div class="resolutionguide tips-1024x768" /> -->
    <div
      ref="container"
      class="grid-edit-container">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'GridShadow',
  methods: {
    getContainerRef () {
      return this.$refs.container
    },
  },
}
</script>

<style lang="less" scoped>
.grid-shadow-wrap {
  position: relative;
  overflow: auto;
}
.grid-edit-container {
  position: relative;
  min-height: 2245px;
  min-width: 1024px;
  background: url('../../assets/grid-shadow.png') repeat 0 0;
  background: rgb(245, 247, 254);
}
.resolutionguide {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  color: #000;
  border-color: #000;
  opacity: .7;
  border-width: 1px;
  border-right-style: dashed;
  border-bottom-style: dashed;
  pointer-events: none;
  font-size: 13px;
  line-height: normal;
  &::after {
    position: absolute;
    right: 8px;
    bottom: 5px;
  }
  &.tips-3840x2160 {
    width: 3840px;
    height: 2160px;
    &::after {
      content: "3840 x 2160";
    }
  }
  &.tips-1920x1080 {
    width: 1920px;
    height: 1080px;
    &::after {
      content: "1920 x 1080";
    }
  }
  &.tips-1440x900 {
    width: 1440px;
    height: 900px;
    &::after {
      content: "1440 x 900";
    }
  }
  &.tips-1024x768 {
    width: 1024px;
    height: 768px;
    &::after {
      content: "1024 x 768";
    }
  }
}
</style>

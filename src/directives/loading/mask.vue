<template>
  <transition name="el-loading-fade" @after-leave="handleAfterLeave">
    <div
      v-show="visible"
      class="oc-mask"
      :style="{ backgroundColor: background || '' }"
      :class="[customClass, { 'oc-mask-fullscreen': fullscreen }]">
      <div class="oc-loading-spinner">
        <a-icon type="loading" class="mb-2" />
        <p v-if="text" class="el-loading-text">{{ text }}</p>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  data () {
    return {
      text: null,
      background: null,
      fullscreen: true,
      visible: false,
      customClass: '',
    }
  },
  methods: {
    handleAfterLeave () {
      this.$emit('after-leave')
    },
    setText (text) {
      this.text = text
    },
  },
}
</script>

<style lang="less">
@import '../../styles/less/theme';

.oc-mask {
  position: absolute;
  z-index: 900;
  top: 0;
  background: rgba(255, 255, 255, 0.9);
  width: 100%;
  height: 100%;
  color: @primary-color;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  flex-flow: column;
  .oc-loading-spinner {
    font-size: 30px;
  }
}
.oc-mask-fullscreen {
  &:extend(.oc-mask);
  width: 100vw;
  height: 100vh;
  top: 0;
}
</style>

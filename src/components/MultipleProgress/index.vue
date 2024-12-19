<template>
  <div class="progress-wrapper" :title="title">
    <div class="title">{{ text }}</div>
    <div class="progress1" v-if="progressConfig.progress1.show" :style="progressConfig.progress1.style" />
    <div class="progress2" v-if="progressConfig.progress2.show" :style="progressConfig.progress2.style" />
    <div class="progress3" v-if="progressConfig.progress3.show" :style="progressConfig.progress3.style" />
  </div>
</template>

<script>
export default {
  name: 'MultipleProgress',
  props: {
    text: String,
    title: String,
    progress1Value: Number,
    progress2Value: Number,
    progress3Value: Number,
  },
  computed: {
    progressConfig () {
      const max = Math.max(this.progress1Value, this.progress2Value, this.progress3Value)
      return {
        progress1: {
          show: true,
          style: {
            width: this.progress1Value / max * 100 + '%',
            background: this.color || 'var(--antd-wave-shadow-color)',
          },
        },
        progress2: {
          show: true,
          style: {
            width: this.progress2Value / max * 100 + '%',
            border: `solid 1px ${this.color || 'var(--antd-wave-shadow-color)'}`,
          },
        },
        progress3: {
          show: true,
          style: {
            width: this.progress3Value / max * 100 + '%',
            border: `dashed 1px ${this.color || 'var(--antd-wave-shadow-color)'}`,
          },
        },
      }
    },
  },
}
</script>

<style lang="less" scoped>
.progress-wrapper {
  width: 100%;
  max-width: 150px;
  .title {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .progress1, .progress2, .progress3 {
    height: 5px;
    max-width: 100px;
  }
  .progress3 {
    margin-top: -1px;
  }
}
</style>

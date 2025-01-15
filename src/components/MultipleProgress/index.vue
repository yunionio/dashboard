<template>
  <div class="progress-wrapper" :title="title">
    <div class="title">{{ text }}</div>
    <!-- <div class="progress0" v-if="progressConfig.progress0.show" :style="progressConfig.progress0.style" /> -->
    <div class="progress1" v-if="progressConfig.progress1.show" :style="progressConfig.progress1.style" />
    <div class="progress2" v-if="progressConfig.progress2.show" :style="progressConfig.progress2.style" />
    <div class="progress3" v-if="progressConfig.progress3.show" :style="progressConfig.progress3.style" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'MultipleProgress',
  props: {
    text: String,
    title: String,
    // progress0Value: {
    //   type: Number,
    //   default: 0.0,
    //   required: false,
    // },
    progress1Value: {
      type: Number,
      default: 0.0,
      required: false,
    },
    progress2Value: {
      type: Number,
      default: 0.0,
      required: false,
    },
    progress3Value: {
      type: Number,
      default: 0.0,
      required: false,
    },
    progress1AlertThreshold: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    ...mapGetters(['theme', 'themeColor']),
    alertColor () {
      return ['#F5222D', '#FA541C'].includes(this.themeColor) ? '#0099F0' : '#F5222D'
    },
    progressConfig () {
      const max = Math.max(this.progress1Value, this.progress2Value, this.progress3Value)
      return {
        // progress0: {
        //   show: true,
        //   style: {
        //     width: (this.progress0Value / max) * 100 + '%',
        //     borderLeft: !this.this.progress0Value ? `1px solid ${this.color || 'var(--antd-wave-shadow-color)'}` : 'none',
        //     background: this.color || 'var(--antd-wave-shadow-color)',
        //   },
        // },
        progress1: {
          show: true,
          style: {
            width: (this.progress1Value / max) * 100 + '%',
            background: this.progress1AlertThreshold && (this.progress1Value / max) > this.progress1AlertThreshold ? this.alertColor : this.color || 'var(--antd-wave-shadow-color)',
            borderLeft: !this.progress1Value ? `1px solid ${this.color || 'var(--antd-wave-shadow-color)'}` : 'none',
          },
        },
        progress2: {
          show: true,
          style: {
            width: (this.progress2Value / max) * 100 + '%',
            border: `solid 1px ${this.color || 'var(--antd-wave-shadow-color)'}`,
            borderRight: this.progress2Value ? `1px solid ${this.color || 'var(--antd-wave-shadow-color)'}` : 'none',
          },
        },
        progress3: {
          show: true,
          style: {
            width: (this.progress3Value / max) * 100 + '%',
            border: `dashed 1px ${this.color || 'var(--antd-wave-shadow-color)'}`,
            borderRight: this.progress3Value ? `1px solid ${this.color || 'var(--antd-wave-shadow-color)'}` : 'none',
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
  max-width: 100px;
  .title {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .progress0, .progress1, .progress2, .progress3 {
    height: 5px;
    box-sizing: border-box;
  }
  .progress3 {
    margin-top: -1px;
  }
}
</style>

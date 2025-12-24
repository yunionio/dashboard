<template>
  <div class="progress-wrapper" :title="title">
    <div class="title">{{ usedKey }}: {{ usedValue }}</div>
    <div class="title">{{ totalKey }}: {{ totalValue }}</div>
    <div class="custom-progress-bar d-flex align-items-center mt-1 mb-1" style="height:6px;">
      <div class="ant-progress-outer" style="background: #d9d9d9;border-radius: 3px;overflow:hidden">
        <div class="ant-progress-bg" :style="{width: `${percent}%`, height: '6px', background: strokeColor, borderRadius: '100px'}" />
      </div>
      <span class="ant-progress-text" style="font-size:12px">{{percent}}%</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UsedPercent',
  props: {
    title: String,
    used: Number,
    total: Number,
    usedLabel: String,
    totalLabel: String,
    usedFormatter: Function,
    totalFormatter: Function,
  },
  computed: {
    percent () {
      const percent = (this.used / this.total) * 100
      if (percent > 0 && percent < 0.5) {
        return 1
      }
      return Math.round(percent)
    },
    strokeColor () {
      if (this.percent > 80) return '#FB4141'
      if (this.percent > 60) return '#FFC145'
      return '#52C41A'
    },
    usedKey () {
      return this.usedLabel || this.$t('common_407')
    },
    totalKey () {
      return this.totalLabel || this.$t('common_234')
    },
    usedValue () {
      return this.usedFormatter ? this.usedFormatter(this.used) : this.used
    },
    totalValue () {
      return this.totalFormatter ? this.totalFormatter(this.total) : this.total
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
    font-size: 12px;
    line-height: 16px;
  }
}
</style>

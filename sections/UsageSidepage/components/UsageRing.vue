<template>
  <div class="usage-ring">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{title}}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
      </div>
      <div class="dashboard-card-body align-items-center">
        <a-progress type="circle" :percent="percent" :strokeWidth="12" :status="status" :strokeColor="percentColor">
          <template v-slot:format><span class="percent-tips" :style="{ color: percentColor }">{{ percentTips }}</span></template>
        </a-progress>
        <div class="flex-fill ml-4">
          <div class="d-flex">
            <div class="flex-shrink-0 flex-grow-0">{{ useLabel }}</div>
            <div class="ml-2 flex-fill text-right">{{ use }}</div>
          </div>
          <div class="d-flex">
            <div class="flex-shrink-0 flex-grow-0">
              {{ unuseLabel }}
            </div>
            <div class="ml-2 flex-fill text-right">{{ unuse }}</div>
          </div>
          <div class="d-flex">
            <div class="flex-shrink-0 flex-grow-0">
              {{ sumLabel }}
            </div>
            <div class="ml-2 flex-fill text-right">{{ sum }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'UsageRing',
  props: {
    title: {
      type: String,
    },
    options: {
      type: Object,
      default: () => {},
    },
  },
  data () {
    return {
      sumLabel: this.options?.label?.sum,
      sum: this.options?.value?.sum,
      useLabel: this.options?.label?.use,
      use: this.options?.value?.use,
      unuseLabel: this.options?.label?.unuse,
      unuse: this.options?.value?.unuse,
    }
  },
  computed: {
    percent () {
      if (this.use && this.sum) {
        return parseInt((this.use / this.sum) * 100)
      }
      return 0
    },
    percentTips () {
      return `${this.percent} %`
    },
    percentColor () {
      if (this.percent < 80) {
        return '#52c41a'
      }
      if (this.percent < 100) {
        return '#faad14'
      }
      return '#f5222d'
    },
    status () {
      let ret = 'normal'
      if (this.percent > 100) {
        ret = 'exception'
      }
      return ret
    },
  },
}
</script>
<style lang="scss" scoped>
.usage-ring {
  width: 100%;
  height:197px;
  margin-bottom: 16px;
  box-sizing: border-box;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.1);
}
</style>

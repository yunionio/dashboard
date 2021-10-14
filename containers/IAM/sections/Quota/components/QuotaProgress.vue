<template>
  <div style="width: 72px">
    <a-progress :showInfo="false" :percent="percent" :status="status" />
  </div>
</template>

<script>
export default {
  name: 'QuotaProgress',
  props: {
    percentage: {
      type: Number,
      required: true,
    },
  },
  data () {
    return {}
  },
  computed: {
    status () {
      if (this.percentage < 60) {
        return 'success'
      }
      if (this.percentage >= 60 && this.percentage <= 80) {
        return 'active'
      }
      if (this.percentage > 80) {
        return 'exception'
      }
      return 'normal'
    },
    percent () {
      return isNaN(this.percentage) ? 0 : this.percentage
    },
  },
}
</script>

<template>
  <a-result status="500" title="500" :subTitle="$t('common_344')">
    <template v-slot:extra>
      <a-button type="primary">
        <router-link to="/">{{`${$t('common_342')}${num ? '(' + num+'s)' : '' }`}}</router-link>
      </a-button>
    </template>
  </a-result>
</template>
<script>
export default {
  name: '403',
  data () {
    return {
      timer: null,
      num: 3,
    }
  },
  created () {
    this.timer = setInterval(() => {
      --this.num
      if (this.num <= 0) {
        this.num = 0
        this.$router.push('/')
      }
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },
}
</script>

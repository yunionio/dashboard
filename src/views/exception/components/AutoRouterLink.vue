<template>
  <router-link :to="path">{{`${text}${timerHidden ? '' : '(' + num+'s)' }`}}</router-link>
</template>
<script>
export default {
  name: 'AutoRouterLink',
  props: {
    text: String,
    time: {
      type: Number,
      default: () => 3,
    },
    path: {
      type: String,
      default: () => '/dashboard',
    },
  },
  data () {
    return {
      timer: null,
      num: this.time,
    }
  },
  computed: {
    timerHidden () {
      return this.num <= 0
    },
  },
  created () {
    this.timer = setInterval(() => {
      --this.num
      if (this.num <= 0) {
        clearInterval(this.timer)
        this.$router.push(this.path)
      }
    }, 1000)
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },
}
</script>

<template>
  <span>{{ formatValue(Number(animatedValue)) }}</span>
</template>
<script>
import anime from 'animejs'

export default {
  name: 'MAnimatedNumber',
  props: {
    value: {
      type: [Number, String],
      default: '0',
      required: true,
    },
    formatValue: {
      type: Function,
      default: value => value,
    },
    easing: {
      type: String,
      default: 'linear',
    },
    duration: {
      type: Number,
      default: 300,
    },
    update: Function,
    begin: Function,
    complete: Function,
    run: Function,
    delay: {
      type: Number,
      default: 0,
    },
    round: {
      default: null,
    },
  },
  data () {
    return {
      animatedValue: 0,
    }
  },
  watch: {
    value (val) {
      this.animateValue(val)
    },
  },
  mounted () {
    this.animateValue(this.value)
  },
  methods: {
    animateValue (value) {
      const {
        begin,
        easing,
        duration,
        complete,
        update,
        run,
        delay,
        round,
      } = this
      anime({
        targets: this,
        animatedValue: value,
        duration,
        easing,
        update,
        begin,
        complete,
        run,
        delay,
        round,
      })
    },
  },
}
</script>

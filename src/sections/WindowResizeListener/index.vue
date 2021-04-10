<template>
  <div class="window-min-width-tips text-center mini-text" v-if="showTips">
    <div class="mt-3">
      <a-icon type="arrows-alt" />
    </div>
    <div class="mt-1">{{$t('common_275')}}</div>
    <div class="mt-1">{{$t('common_276')}}</div>
  </div>
</template>

<script>
import debounce from 'lodash/debounce'

export default {
  name: 'WindowResizeListener',
  data () {
    return {
      showTips: false,
    }
  },
  mounted () {
    this.update()
    this.debounceUpdate = debounce(this.update, 300)
    window.addEventListener('resize', this.debounceUpdate, false)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener(document.body, this.debounceUpdate, false)
      this.debounceUpdate = null
      clearTimeout(this.showTipsTimer)
    })
  },
  methods: {
    update () {
      if (document.body.clientWidth >= 1280) {
        this.showTips = false
      } else {
        clearTimeout(this.showTipsTimer)
        this.showTips = true
        this.showTipsTimer = setTimeout(() => {
          this.showTips = false
        }, 3000)
      }
    },
  },
}
</script>

<style lang="less" scoped>
.window-min-width-tips {
  width: 240px;
  height: 100px;
  position: fixed;
  left: 50%;
  top: 50%;
  margin-left: -100px;
  margin-top: -50px;
  background-color: rgba(104, 105, 120, .9);
  color: #fff;
  border-radius: 4px;
  z-index: 9999;
  .anticon {
    font-size: 26px;
  }
}
</style>

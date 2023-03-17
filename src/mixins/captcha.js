export default {
  data () {
    return {
      captchaRefreshTimer: null,
    }
  },
  methods: {
    initCaptchaTimer () {
      if (this.captchaRefreshTimer) {
        clearTimeout(this.captchaRefreshTimer)
        this.captchaRefreshTimer = null
      }
      if (this._isDestroyed) return // 防止页面销毁后定时器还在执行
      this.captchaRefreshTimer = setTimeout(() => {
        this.fetchCaptcha && this.fetchCaptcha()
      }, 1000 * 60 * 60)
    },
  },
  beforeDestroy () {
    clearTimeout(this.captchaRefreshTimer)
    this.captchaRefreshTimer = null
  },
}

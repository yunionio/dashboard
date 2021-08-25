import './index.scss'

export default {
  name: 'Copy',
  props: {
    message: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      visible: false,
      title: '',
    }
  },
  methods: {
    clearTimer () {
      clearTimeout(this.timer)
      this.timer = null
    },
    async doCopy (e) {
      e.stopPropagation()
      try {
        this.title = this.$t('common.copy')
        await this.$copyText(this.message)
      } catch (error) {
        this.title = this.$t('common.copyError')
      }
      this.clearTimer()
      this.timer = setTimeout(() => {
        this.visible = false
      }, 800)
    },
  },
  destroyed () {
    this.clearTimer()
  },
  render (h) {
    return (
      <a-tooltip
        v-model={ this.visible }
        title={ this.title }
        trigger='click'
        destroyTooltipOnHide>
        <icon type="copy" onClick={ this.doCopy } />
        {/* <a-icon
          class='copy-icon'
          type='copy'
          class='primary-color'
          onClick={ this.doCopy } /> */}
      </a-tooltip>
    )
  },
}

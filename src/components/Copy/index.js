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
        this.title = '已复制'
        await this.$copyText(this.message)
      } catch (error) {
        this.title = '复制失败'
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
        <a-icon
          class='copy-icon'
          type='copy'
          theme='twoTone'
          twoToneColor='#1890ff'
          onClick={ this.doCopy } />
      </a-tooltip>
    )
  },
}

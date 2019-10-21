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
      copied: false,
    }
  },
  methods: {
    clearTimer () {
      clearTimeout(this.timer)
      this.timer = null
    },
    copySuccess () {
      this.clearTimer()
      this.copied = true
      this.timer = setTimeout(() => {
        this.copied = false
      }, 800)
    },
    doCopy (e) {
      e.stopPropagation()
      this.$copyText(this.message).then(() => {
        this.copySuccess()
      })
    },
  },
  destroyed () {
    this.clearTimer()
  },
  render (h) {
    return (
      <div class="copy-icon" onClick={ this.doCopy }>
        <a-icon type='copy' theme='twoTone' twoToneColor='#1890ff' />
        <transition name="copy_icon-slide">
          { this.copied ? <span class='copy-tips'>已复制</span> : null }
        </transition>
      </div>
    )
  },
}

export default {
  data () {
    return {
      resizeRatio: 1,
    }
  },
  computed: {
    autoResizeRatioContainerStyle () {
      return {
        transformOrigin: 'left top 0px',
        transform: `scale(${this.resizeRatio}, ${this.resizeRatio})`,
        left: `${(document.body.clientWidth - (1920 * this.resizeRatio)) / 2}px`,
        display: 'flex',
        width: '1920px',
        height: '940px',
        justifyContent: 'center',
        position: 'absolute',
      }
    },
  },
  destroyed () {
    window.removeEventListener('resize', this.autoResizeContainer)
  },
  mounted () {
    this.autoResizeContainer()
    window.addEventListener('resize', this.autoResizeContainer)
  },
  methods: {
    autoResizeContainer () {
      const clientWidth = document.body.clientWidth
      const clientHeight = document.body.clientHeight
      this.ratioX = clientWidth / 1920
      this.ratioY = clientHeight / 940
      let ratio = Math.min(this.ratioX, this.ratioY)
      if (clientWidth <= 1024 && clientHeight <= 768) {
        ratio = Math.max(this.ratioX, this.ratioY)
      }
      this.resizeRatio = ratio
    },
  },
}

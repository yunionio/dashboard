<template>
  <div class="wrap">
    <div class="auth-container d-flex justify-content-center align-items-center" :style="containerStyles">
      <router-view />
    </div>
    <div class="cp">{{ copyright }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AuthLayout',
  data () {
    return {
      containerStyles: {
        transform: 'scale(1, 1)',
        transformOrigin: 'left top 0px',
        left: '0',
        width: '1920px',
        height: '940px',
      },
    }
  },
  computed: mapGetters(['copyright']),
  mounted () {
    if (document.body.clientWidth < 1920) {
      this.containerStyles.height = '100%'
      this.containerStyles.width = '100%'
    } else {
      this.resizeCharts()
      window.addEventListener('resize', this.resizeCharts)
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    resizeCharts () {
      let clientWidth = document.body.clientWidth
      let clientHeight = document.body.clientHeight
      this.ratioX = clientWidth / 1920
      this.ratioY = clientHeight / 940
      let ratio = Math.min(this.ratioX, this.ratioY)
      if (clientWidth <= 1024 && clientHeight <= 768) {
        ratio = Math.max(this.ratioX, this.ratioY)
      }
      this.containerStyles.transform = `scale(${ratio}, ${ratio})`
      this.containerStyles.transformOrigin = 'left top 0px'
      this.containerStyles.left = `${(document.body.clientWidth - (1920 * ratio)) / 2}px`
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  height: 100%;
  width: 100%;
  background-color: rgb(0, 51, 89);
  overflow: hidden;
  background-image: url('../../assets/images/login-bg.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.auth-container {
  width: 1920px;
  height: 940px;
  position: absolute;
}
.cp {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  text-align: center;
  color: #fff;
}
</style>

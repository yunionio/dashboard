<template>
  <div class="oc-term-box" v-show="openCloudShell">
    <div class="oc-term-content">
      <iframe src="/vminstance" width="100%" height="100%" style="margin-top: 10px; border: none;" />
    </div>
    <div class="oc-term-resize" title="term resize"><div class="mask">一</div></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'OcTerm',
  data () {
    return {}
  },
  computed: {
    ...mapState('common', {
      openCloudShell: state => state.openCloudShell,
    }),
  },
  mounted () {
    this.initDrag()
  },
  methods: {
    initDrag () {
      var resize = document.getElementsByClassName('oc-term-resize')[0]
      var mask = document.getElementsByClassName('mask')[0]
      var bottom = document.getElementsByClassName('oc-term-content')[0]

      resize.onmousedown = function (e) {
        var startY = e.clientY
        mask.style.height = '300px'
        mask.style.background = 'transparent'
        resize.bottom = bottom.offsetHeight

        function moveHandle (e) {
          var endY = e.clientY
          var clientHeight = document.documentElement.clientHeight || document.body.clientHeight
          var moveLen = resize.bottom + (startY - endY)

          if (moveLen > clientHeight) {
            moveLen = clientHeight
          }
          if (moveLen < 10) {
            moveLen = 0
          }

          resize.style.bottom = moveLen + 'px'
          bottom.style.height = moveLen + 'px'
        }

        document.onmousemove = moveHandle
        resize.onmouseup = document.onmouseup = function (evt) {
          mask.style.height = '8px'
          document.onmousemove = null
          document.onmouseup = null
          resize.releaseCapture && resize.releaseCapture() // 当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
        }
        resize.setCapture && resize.setCapture() // 该函数在属于当前线程的指定窗口里设置鼠标捕获
        return false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.oc-term-box {
  position: fixed;
  bottom: 0;
  height: 200px;
  width: 100%;
  z-index: 999;
}
.oc-term-content {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 200px;
  background: #fff;
}
.oc-term-resize {
  position: absolute;
  bottom: 200px;
  height: 8px;
  width: 100%;
  color: #fff;
  background-color: #eaeaea;
  cursor: row-resize;
  &:hover {
    color: #eaeaea;
    .mask {
      color: blue;
    }
  }
  .mask {
    position: absolute;
    width: 100%;
    left: 0;
    top: -7px;
    z-index: 999;
    color: red;
    text-align: center;
  }
}
</style>

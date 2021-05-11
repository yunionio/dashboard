<template>
  <div class="oc-term-box" v-show="openCloudShell">
    <xterm :connectParams="connectParams" :height="height" class="oc-term-content" />
    <div class="oc-term-resize" title="term resize">
      <div class="mask">一</div>
      <a-icon class="oc-term-close" type="close" @click="closeCloudShell" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'

export default {
  name: 'OcTerm',
  data () {
    return {
      connectParams: '',
      height: 300,
    }
  },
  computed: {
    ...mapState('common', {
      openCloudShell: state => state.openCloudShell,
    }),
  },
  watch: {
    openCloudShell (val, old) {
      this.$nextTick(() => {
        if (val) {
          this.fetchData()
        } else {
          this.connectParams = ''
        }
      })
    },
    $route (to, from) {
      if (to.path === '/auth/login/chooser') {
        this.$store.commit('common/SET_OPEN_CLOUDSHELL', false)
      }
    },
  },
  created () {
    this.cluster_manager = new this.$Manager('kubeclusters', 'v1')
    this.pod_manager = new this.$Manager('pods', 'v1')
  },
  mounted () {
    this.initDrag()
  },
  methods: {
    initDrag () {
      var resize = document.getElementsByClassName('oc-term-resize')[0]
      var mask = document.getElementsByClassName('mask')[0]
      var bottom = document.getElementsByClassName('oc-term-content')[0]
      var that = this

      bottom.style.height = resize.bottom + 'px'
      that.height = resize.bottom

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
            moveLen = clientHeight - 20
          }
          if (moveLen < 10) {
            moveLen = 0
          }

          resize.style.bottom = moveLen + 'px'
          bottom.style.height = moveLen + 'px'
          that.height = moveLen
        }

        document.onmousemove = debounce(moveHandle, 300)
        resize.onmouseup = document.onmouseup = function (evt) {
          mask.style.height = '20px'
          document.onmousemove = null
          document.onmouseup = null
          resize.releaseCapture && resize.releaseCapture() // 当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
        }
        resize.setCapture && resize.setCapture() // 该函数在属于当前线程的指定窗口里设置鼠标捕获
        return false
      }
    },
    async fetchData () {
      const { data } = await new this.$Manager('webconsole', 'v1').objectRpc({
        methodname: 'DoCloudShell',
      })
      this.$nextTick(() => {
        this.connectParams = data.connect_params
      })
    },
    closeCloudShell () {
      this.$store.commit('common/SET_OPEN_CLOUDSHELL', false)
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
  height: 20px;
  width: 100%;
  color: #fff;
  background-color: #eaeaea;
  &:hover {
    color: #eaeaea;
    .mask {
      color: blue;
    }
  }
  .mask {
    position: absolute;
    width: 98%;
    left: 0;
    top: 0;
    z-index: 999;
    color: red;
    text-align: center;
    cursor: row-resize;
  }
}
.oc-term-close {
  position: absolute;
  right: 2px;
  top: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  z-index: 99;
  cursor: pointer;
}
</style>

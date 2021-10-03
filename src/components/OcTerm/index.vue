<template>
  <div class="oc-term-box" id="oc-term-box" v-if="openCloudShell">
    <div class="oc-term-resize" title="term resize" v-dragging="handleResize">
      <div class="mask">一</div>
      <a-icon class="oc-term-close" type="close" @click="closeCloudShell" />
    </div>
    <div class="oc-term-content">
      <xterm ref="xterm" :connectParams="connectParams" class="w-100 h-100" @close="onCloudShellClose" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'OcTerm',
  directives: {
    dragging (el, binding) {
      const current = el
      const targetDiv = document.getElementById('oc-term-box')
      current.onmousedown = (e) => {
        document.onmousemove = (e) => {
          let th = document.body.clientHeight - e.clientY
          if (th < 100) {
            th = 100
          }
          targetDiv.style.height = th + 'px'
          binding.value()
        }
        document.onmouseup = (e) => {
          document.onmousemove = null
          document.onmouseup = null
        }
        return false
      }
    },
  },
  data () {
    return {
      connectParams: '',
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
  methods: {
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
    handleResize () {
      this.$refs.xterm.term.fit()
    },
    onCloudShellClose () {
      console.log('cloudshell close!!!')
      this.$nextTick(() => {
        this.closeCloudShell()
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.oc-term-box {
  position: fixed;
  bottom: 0;
  height: 200px;
  left: 0;
  right: 0;
  z-index: 999;
}
.oc-term-resize {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background-color: #eaeaea;
  color: #fff;
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
.oc-term-content {
  position: absolute;
  top: 20px;
  bottom: 0;
  left: 0;
  right: 0;
  background: #000;
  padding-bottom: 20px;
  ::v-deep {
    #xterm {
      height: 100% !important;
      min-height: auto !important;
    }
    .xterm-viewport {
      height: 100% !important;
    }
  }
}
</style>

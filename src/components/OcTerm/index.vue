<template>
  <div class="cloudshell-box" v-cloudshellDragResize="handleResize" v-if="openCloudShell" :style="cloudShellStyle">
    <div class="cloudshell-wrapper">
      <div class="cloudshell-header">
        <div class="cloudshell-header-title">
          <icon type="cloudshell" class="icon" />
          <span class="ml-1">CloudShell</span>
        </div>
        <!-- <div class="header-resize-btn">一</div> -->
        <div class="cloudshell-minimize">
          <icon type="minimize" class="minimize" @click="() => handleResizeChange('minimize')" />
        </div>
        <div class="cloudshell-bigger">
          <icon type="bigger" class="bigger" @click="() => handleResizeChange('bigger')" />
        </div>
        <div class="cloudshell-smaller">
          <icon type="smaller" class="smaller" @click="() => handleResizeChange('smaller')" />
        </div>
        <div class="cloudshell-close" @click="closeCloudShell">
          <a-icon class="close" type="close" />
        </div>
      </div>
      <div class="cloudshell-content">
        <xterm ref="xterm" :connectParams="connectParams" class="w-100 h-100" @close="onCloudShellClose" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'OcTerm',
  data () {
    return {
      connectParams: '',
    }
  },
  computed: {
    ...mapState('common', {
      openCloudShell: state => state.openCloudShell,
      cloudShellHeight: state => state.cloudShellHeight,
    }),
    cloudShellStyle () {
      return {
        height: `${this.openCloudShell ? this.cloudShellHeight : 0}px`,
        flex: `0 0 ${this.openCloudShell ? this.cloudShellHeight : 0}px`,
      }
    },
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
      if (to.path && to.path.startsWith('/auth/login')) {
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
    handleResize (e) {
      const containerDom = document.querySelector('.cloudshell-box')
      if (containerDom) {
        const height = containerDom.getBoundingClientRect().height
        this.$store.commit('common/SET_CLOUDSHELL_HEIGHT', height)
      }
      if (this.$refs.xterm) {
        this.$refs.xterm.term.fit()
      }
    },
    onCloudShellClose () {
      console.log('cloudshell close!!!')
      this.$nextTick(() => {
        this.closeCloudShell()
      })
    },
    handleResizeChange (type) {
      const containerDom = document.querySelector('.cloudshell-box')
      const dragDom = containerDom.querySelector('.cloudshell-wrapper')
      let height = document.body.offsetHeight - 60
      if (type === 'smaller') {
        height = 350
      } else if (type === 'minimize') {
        if (containerDom.clientHeight === 25) {
          height = 350
        } else {
          height = 25
        }
      }
      if (containerDom) {
        containerDom.style.flex = `0 0 ${height}px`
        containerDom.style.height = height + 'px'
      }
      if (dragDom) {
        dragDom.style.height = height + 'px'
        dragDom.style.flex = `0 0 ${height}px`
      }
      this.$store.commit('common/SET_CLOUDSHELL_HEIGHT', height)
      if (this.$refs.xterm) {
        this.$refs.xterm.term.fit()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.cloudshell-box {
  width: 100%;
  // height: 350px;
  position: relative;
  // flex: 0 0 350px;
  overflow: hidden;
}
.cloudshell-wrapper {
  // position: fixed;
  // top: calc(100vh - 355px);
  // height: 350px;
  // width: calc(100vw - 10px);
  // left: 5px;
  // right: 5px;
  // bottom: 5px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background: #000;
  // border-radius: 3px;
}
.cloudshell-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 25px;
  background-color: #eaeaea;
  color: #fff;
  // border-radius: 2.5px 2.5px 0 0;
  &:hover {
    color: #eaeaea;
  }
  .cloudshell-header-title {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    color: rgba(0,0,0,0.45);
    font-size: 12px;
    margin-left: 10px;
    .icon {
      font-size: 16px;
    }
  }
  .header-resize-btn {
    position: absolute;
    width: 20px;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    z-index: 999;
    color: red;
    text-align: center;
    &:hover{
      color: blue;
      cursor: row-resize;
    }
  }
  .cloudshell-close {
    position: absolute;
    right: 5px;
    top: 0px;
    width: 25px;
    height: 25px;
    z-index: 99;
    text-align: center;
    cursor: pointer;
    font-size: 18px;
    .close {
      color: rgba(0,0,0,0.45);
    }
    &:hover{
      .close{
        color: blue;
      }
    }
  }
  .cloudshell-bigger {
    position: absolute;
    right: 30px;
    top: 1px;
    width: 25px;
    height: 25px;
    z-index: 99;
    text-align: center;
    cursor: pointer;
    font-size: 16px;
    .bigger {
      color: rgba(0,0,0,0.45);
    }
    &:hover{
      .bigger{
        color: blue;
      }
    }
  }
  .cloudshell-smaller {
    position: absolute;
    right: 55px;
    top: 1px;
    width: 25px;
    height: 25px;
    z-index: 99;
    text-align: center;
    cursor: pointer;
    font-size: 16px;
    .smaller {
      color: rgba(0,0,0,0.45);
    }
    &:hover{
      .smaller{
        color: blue;
      }
    }
  }
  .cloudshell-minimize {
    position: absolute;
    right: 80px;
    top: 1px;
    width: 25px;
    height: 25px;
    z-index: 99;
    text-align: center;
    cursor: pointer;
    font-size: 16px;
    .minimize {
      color: rgba(0,0,0,0.45);
    }
    &:hover{
      .minimize{
        color: blue;
      }
    }
  }
}
.cloudshell-content {
  position: absolute;
  top: 25px;
  bottom: 10px;
  left: 10px;
  right: 10px;
  background: #000;
  padding-bottom: 10px;
  ::v-deep {
    #xterm {
      height: 100% !important;
      min-height: auto !important;
    }
    .xterm-viewport {
      height: 100%!important;
      overflow-y: auto;
    }
    .xterm-viewport::-webkit-scrollbar {
      width: 15px;
    }
  }
}
</style>

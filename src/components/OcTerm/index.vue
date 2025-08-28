<template>
  <div v-cloudshellDragResize="handleResize" v-if="openCloudShell">
    <div class="cloudshell-wrapper">
      <div class="cloudshell-header">
        <div class="header-resize-btn">一</div>
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
    handleResize () {
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
  },
}
</script>

<style lang="scss" scoped>
.cloudshell-wrapper {
  position: fixed;
  top: calc(100vh - 355px);
  height: 350px;
  width: calc(100vw - 10px);
  left: 5px;
  right: 5px;
  bottom: 5px;
  z-index: 999;
  background: #000;
  border-radius: 3px;
}
.cloudshell-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background-color: #eaeaea;
  color: #fff;
  border-radius: 2.5px 2.5px 0 0;
  &:hover {
    color: #eaeaea;
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
    height: 20px;
    z-index: 99;
    text-align: center;
    cursor: pointer;
    .close {
      color: rgba(0,0,0,0.45);
    }
    &:hover{
      .close{
        color: blue;
      }
    }
  }
}
.cloudshell-content {
  position: absolute;
  top: 20px;
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

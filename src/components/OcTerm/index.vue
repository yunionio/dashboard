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
  top: calc(100vh - 300px);
  height: 300px;
  width: 100vw;
  left: 0;
  z-index: 999;
  background: #000;
}
.cloudshell-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  background-color: #eaeaea;
  color: #fff;
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
    right: 0px;
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
      height: 100%!important;
      overflow-y: auto;
    }
  }
}
</style>

<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <component :is="layout">
        <router-view />
      </component>
      <dialog-manager />
      <side-page-manager />
      <window-resize-listener />
    </div>
  </a-config-provider>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import DefaultLayout from '@/layouts/Default'
import FullScreenLayout from '@/layouts/FullScreen'
import DialogManager from '@/sections/DialogManager'
import SidePageManager from '@/sections/SidePageManager'
import WindowResizeListener from '@/sections/WindowResizeListener'
import notificationListener from '@/utils/notificationListener'

export default {
  name: 'App',
  components: {
    DefaultLayout,
    FullScreenLayout,
    DialogManager,
    SidePageManager,
    WindowResizeListener,
  },
  data () {
    return {
      locale: zhCN,
    }
  },
  computed: {
    ...mapGetters(['auth']),
    layout () {
      return `${(this.$route.meta.layout || 'default')}-layout`
    },
  },
  watch: {
    'auth.auth' (val, oldVal) {
      if (val && !R.equals(val, oldVal)) {
        if (val.session) {
          this.connect(val.session)
        }
      }
    },
  },
  created () {
    this.initIO()
  },
  methods: {
    initIO () {
      if (!this.$appConfig.isPrivate) return
      const options = {}
      if (process.env.NODE_ENV === 'production') {
        options.server = '/'
      }
      this.notificationListener = notificationListener(this.$store, options)
      this.socket = this.notificationListener.getSocket()
      this.connect(this.auth && this.auth.auth && this.auth.auth.session)
    },
    connect (session) {
      if (!session) return
      this.socket.io.opts.query.session = session
      this.socket.connect()
    },
  },
}
</script>

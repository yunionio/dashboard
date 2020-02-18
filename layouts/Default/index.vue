<template>
  <div class="app-container">
    <navbar />
    <div class="app-content position-relative h-100">
      <sidebar :l2-menu-visible.sync="l2MenuVisible" />
      <div id="app-page" class="app-page" :class="{ 'l2-menu-show': l2MenuVisible }">
        <slot />
      </div>
    </div>
    <side-page-manager />
  </div>
</template>

<script>
import Navbar from '@scope/layouts/Navbar'
import Sidebar from '../Sidebar'
import SidePageManager from '@/sections/SidePageManager'
import notificationListener from '@/utils/notificationListener'

export default {
  name: 'DefaultLayout',
  components: {
    Sidebar,
    Navbar,
    SidePageManager,
  },
  data () {
    return {
      l2MenuVisible: false,
    }
  },
  created () {
    this.enableWs()
  },
  methods: {
    enableWs () {
      if (!this.$appConfig.isPrivate) return
      let proto = 'wss'
      if (window.location.protocol === 'http:') {
        proto = 'ws'
      }
      const options = {}
      if (process.env.NODE_ENV === 'production') {
        options.server = `${proto}://${window.location.hostname}`
      }
      notificationListener(this.$store, options)
    },
  },
}
</script>

<style lang="scss" scoped>
.app-content {
  padding-top: 60px;
}
.app-page {
  margin-left: 60px;
  margin-bottom: 74px;
  // 整体最小宽度为1280px（1280 - 菜单栏64 = 1216)
  min-width: 1216px;
  padding: 15px;
  &.l2-menu-show {
    // 整体最小宽度为1280px（1280 - 菜单栏224 = 1056)
    margin-left: 224px;
    min-width: 1056px;
  }
}
</style>

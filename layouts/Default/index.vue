<template>
  <div class="app-container">
    <sidebar :l2-menu-visible.sync="l2MenuVisible" />
    <div class="position-relative h-100">
      <navbar />
      <div class="app-page px-4 pb-4" :class="{ 'l2-menu-show': l2MenuVisible }">
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
.app-page {
  padding-top: 80px;
  margin-left: 80px;
  margin-bottom: 74px;
  &.l2-menu-show {
    margin-left: 224px;
  }
}
</style>

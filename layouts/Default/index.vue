<template>
  <div class="app-container">
    <navbar />
    <div class="app-content position-relative h-100">
      <sidebar :l2-menu-visible.sync="l2MenuVisible" />
      <div id="app-page" class="app-page" :class="{ 'l2-menu-show': l2MenuVisible }">
        <top-alert />
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Navbar from '@scope/layouts/Navbar'
import Sidebar from '../Sidebar'
import TopAlert from '@/sections/TopAlert'

export default {
  name: 'DefaultLayout',
  components: {
    Sidebar,
    Navbar,
    TopAlert,
  },
  data () {
    return {
      l2MenuVisible: false,
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
    ]),
  },
  watch: {
    'userInfo.id' (val) {
      if (val) {
        this.$store.dispatch('auth/getCapabilities')
      }
    },
  },
  created () {
    if (this.userInfo.id) {
      this.$store.dispatch('auth/getCapabilities')
    }
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
  padding: 15px;
  &.l2-menu-show {
    margin-left: 224px;
  }
}
</style>

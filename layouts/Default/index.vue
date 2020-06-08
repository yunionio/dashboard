<template>
  <div class="app-container">
    <template v-if="$store.state.auth.canRenderDefaultLayout">
      <navbar />
        <div class="app-content position-relative h-100" :class="{ 'overflow-hidden': isSidepageOpen }">
          <sidebar :l2-menu-visible.sync="l2MenuVisible" />
          <div id="app-page" class="app-page" :class="{ 'l2-menu-show': l2MenuVisible }">
            <top-alert />
            <slot />
          </div>
        </div>
    </template>
    <template v-else>
      <div class="h-100 d-flex align-items-center justify-content-center">
        <a-spin />
      </div>
    </template>
  </div>
</template>

<script>
import Navbar from '@scope/layouts/Navbar'
import { mapGetters } from 'vuex'
import Sidebar from '../Sidebar'
import Navbar from '@scope/layouts/Navbar'
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
    ...mapGetters(['isSidepageOpen']),
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

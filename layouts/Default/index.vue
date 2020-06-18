<template>
  <div class="app-container">
    <template v-if="$store.state.auth.canRenderDefaultLayout">
      <navbar />
        <div class="app-content position-relative h-100">
          <sidebar v-if="guideKeys.length > 0" :l2-menu-visible.sync="l2MenuVisible" />
          <div :style="{marginLeft: !guideKeys.length ? 0 : '60px' }" id="app-page" class="app-page" :class="{ 'l2-menu-show': l2MenuVisible }">
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
    guideKeys () {
      return this.$store.state.guide.keys
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
  padding: 15px;
  &.l2-menu-show {
    margin-left: 224px !important;
  }
}
</style>

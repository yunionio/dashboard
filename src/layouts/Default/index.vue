<template>
  <div class="app-container">
    <template v-if="$store.state.auth.canRenderDefaultLayout">
      <navbar />
      <div class="app-content position-relative h-100">
        <sidebar-drawer v-if="isShowMenu" :active-menu="l2Menu" />
        <l2-menu :l2-menu="l2Menu" v-if="l2MenuVisible && isShowMenu" />
        <div
          id="app-page"
          class="app-page"
          :class="{ 'l2-menu-show': l2MenuVisible && l2MenuVisibleForStore }">
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
import { mapGetters } from 'vuex'
import SidebarDrawer from '../Sidebar/Drawer'
import L2Menu from '../Sidebar/Menu'
import Navbar from '@scope/layouts/Navbar'
import TopAlert from '@/sections/TopAlert'
import { menusConfig } from '@/router/routes'

export default {
  name: 'DefaultLayout',
  components: {
    SidebarDrawer,
    Navbar,
    TopAlert,
    'l2-menu': L2Menu,
  },
  data () {
    return {
      l2MenuVisible: false,
      l2Menu: {},
      menuitems: menusConfig,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isShowMenu () {
      const { globalSetting } = this.$store.state
      if (!globalSetting || (globalSetting && !globalSetting.value) || (globalSetting.value && !globalSetting.value.key)) {
        return true
      }
      return globalSetting.value.key.length > 0
    },
    l2MenuVisibleForStore () {
      return this.$store.state.setting.l2MenuVisible
    },
  },
  watch: {
    $route: {
      handler (val, oldVal) {
        const newParentPath = val.matched[0] && val.matched[0].path
        const oldParentPath = oldVal && oldVal.matched && oldVal.matched[0] && oldVal.matched[0].path
        if (newParentPath !== oldParentPath) {
          const firstMatched = val.matched[0]
          for (let i = 0, len = this.menuitems.length; i < len; i++) {
            const item = this.menuitems[i]
            if (item.meta.group === firstMatched.meta.group) {
              this.l2Menu = item
              let l2MenuVisible = false
              if (item.menus) {
                l2MenuVisible = true
              }
              this.l2MenuVisible = l2MenuVisible
              break
            } else {
              this.l2Menu = {}
              this.l2MenuVisible = false
            }
          }
        }
      },
      immediate: true,
    },
  },
}
</script>

<style lang="less" scoped>
.app-content {
  padding-top: 60px;
}
.app-page {
  margin-bottom: 74px;
  padding: 15px;
  &.l2-menu-show {
    margin-left: 160px !important;
  }
}
</style>

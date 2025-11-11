<template>
  <div class="app-container" :style="appContainerStyle">
    <template v-if="$store.state.auth.canRenderDefaultLayout">
      <navbar />
      <div class="app-content position-relative h-100">
        <sidebar-drawer v-if="isShowMenu" :active-menu="l2Menu" />
        <l2-menu :l2-menu="l2Menu" v-if="l2MenuVisible && isShowMenu" />
        <div
          id="app-page"
          class="app-page"
          :class="{ 'l2-menu-show': l2MenuVisible && l2MenuVisibleForStore }">
          <div :style="appPageWrapperStyle">
            <top-alert />
            <div class="app-page-content">
              <slot />
            </div>
          </div>
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
import { mapGetters, mapState } from 'vuex'
import Navbar from '@scope/layouts/Navbar'
import TopAlert from '@/sections/TopAlert'
import { menusConfig } from '@/router/routes'
import L2Menu from '../Sidebar/Menu'
import SidebarDrawer from '../Sidebar/Drawer'

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
    ...mapState('common', {
      openCloudShell: state => state.openCloudShell,
      cloudShellHeight: state => state.cloudShellHeight,
    }),
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
    appPageWrapperStyle () {
      const style = {
        flex: '1 1 100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }
      return style
    },
    appContainerStyle () {
      if (this.openCloudShell) {
        return {
          maxHeight: `calc(100% - ${this.cloudShellHeight}px)`,
          flex: '1 1 auto',
        }
      }
      return {}
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
  display: flex;
  flex-direction: column;
}
.app-page {
  // margin-bottom: 74px;
  padding: 15px 15px 0 15px;
  &.l2-menu-show {
    margin-left: 160px !important;
  }
  overflow: auto;
}
.app-page-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  // height: 100%;
}
</style>

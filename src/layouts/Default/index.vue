<template>
  <div class="app-container">
    <template v-if="$store.state.auth.canRenderDefaultLayout">
      <navbar />
      <div class="app-content position-relative h-100">
        <sidebar-drawer v-if="isShowMenu" :active-menu="l2Menu" :menus="showMenus" :staredMenus="staredMenus" @routerChange="onRouterChange" />
        <l2-menu :l2-menu="l2Menu" v-if="l2MenuVisible && isShowMenu" :staredMenus="staredMenus" @routerChange="onRouterChange" />
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
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'
import storage from '@/utils/storage'
import Navbar from '@scope/layouts/Navbar'
import TopAlert from '@/sections/TopAlert'
import { hasPermission } from '@/utils/auth'
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
      staredList: state => state.sidebar.staredList,
    }),
    menus () {
      const ret = this.menuitems.filter(m1item => {
        let flag = false
        if (this.showMenu(m1item)) {
          if (m1item.menus) {
            m1item.menus.forEach(m2item => {
              if (this.showMenu(m2item)) {
                if (m2item.submenus) {
                  m2item.submenus.forEach(m3item => {
                    if (this.showMenu(m3item)) {
                      flag = true
                    }
                  })
                } else {
                  flag = true
                }
              }
            })
          } else {
            flag = true
          }
        }
        return flag
      })
      return ret
    },
    showMenus () {
      return this.menus.map(item => {
        if (item.menu?.path === '/dashboard') {
          item.meta.label = '全部'
          item.meta.icon = 'dashboard-search'
        }
        return item
      })
    },
    staredMenus () {
      const ls = this.showMenus.filter(item => {
        return item.index !== 1
      })
      const list = []
      ls.map(item => {
        if (item.menus) {
          item.menus.map(menu => {
            if (menu.submenus) {
              menu.submenus.map(submenu => {
                if (this.staredList.includes(submenu.path)) {
                  list.push({
                    title: this.getLabel(submenu.meta),
                    path: submenu.path,
                  })
                }
              })
            }
          })
        }
      })
      list.sort((a, b) => {
        const aIdx = this.staredList.indexOf(a.path)
        const bIdx = this.staredList.indexOf(b.path)
        return aIdx - bIdx
      })
      return list
    },
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
  methods: {
    getLabel (meta) {
      if (meta.t) {
        return this.$t(meta.t)
      }
      return R.is(Function, meta.label) ? meta.label() : meta.label
    },
    getMenuHidden (menu) {
      if (!R.isNil(menu.meta.hidden)) {
        if (R.is(Function, menu.meta.hidden)) {
          return menu.meta.hidden(this.userInfo)
        }
        return menu.meta.hidden
      }
      if (!R.isNil(menu.meta.invisible)) {
        if (R.is(Function, menu.meta.invisible)) {
          return menu.meta.invisible(this.userInfo)
        }
        return menu.meta.invisible
      }
      return false
    },
    showMenu (item) {
      const hidden = this.getMenuHidden(item)
      if (R.isNil(item.meta.permission) || R.isEmpty(item.meta.permission)) {
        return !hidden && true
      }
      return !hidden && hasPermission({ key: item.meta.permission })
    },
    onRouterChange (menu, ignoreJump = false) {
      if (!ignoreJump) {
        this.$router.push(menu.path)
      }
      let menus = this.$store.getters.common.sidebar.recentList
      const index = R.findIndex(R.propEq('path', menu.path))(menus)
      if (index !== -1) {
        menus = R.remove(index, 1, menus)
      }
      menus = R.prepend(menu.path, menus)
      if (menus.length > 6) {
        menus = R.slice(0, 6, menus)
      }
      storage.set('__oc_recent_visit__', menus)
      this.$store.dispatch('common/updateObject', {
        name: 'sidebar',
        data: {
          recentList: menus,
        },
      })
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

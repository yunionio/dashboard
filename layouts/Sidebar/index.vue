<template>
  <div class="sidebar-wrap" @mouseleave="handleMouseLeave">
    <level1-menu :menuitems="menuitems" :show-menu="showMenu" :ghost-l2-menu="ghostL2Menu" @ghost-l2-change="ghostL2ChangeHandle" @set-ghost-l2-menu-scroll-top="setGhostL2MenuScrollTop" />
    <level2-menu ref="level2menu" :ghost-l2-menu-scroll-top="ghostL2MenuScrollTop" :current-menu="currentMenu" :show-menu="showMenu" :visible="l2MenuVisible" />
    <transition name="slide-fade">
      <level2-menu
        :key="showGhostL2Menu.index"
        v-if="showGhostL2Menu"
        :current-menu="ghostL2Menu"
        :show-menu="showMenu"
        visible
        style="zindex: 5;"
        @clear-ghost-l2-menu="handleMouseLeave"
        @set-ghost-l2-menu-scroll-top="setGhostL2MenuScrollTop" />
    </transition>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import Level1Menu from './level-1-menu'
import Level2Menu from './level-2-menu'
import { menusConfig } from '@/router/routes'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'Sidebar',
  components: {
    Level1Menu,
    Level2Menu,
  },
  props: {
    l2MenuVisible: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      menuitems: menusConfig,
      // 选择菜单
      currentMenu: {},
      // 临时菜单
      ghostL2Menu: {},
      ghostL2MenuScrollTop: 0,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    showGhostL2Menu () {
      return this.ghostL2Menu.menus && this.ghostL2Menu.menus.length > 0
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
              this.currentMenu = item
              let l2MenuVisible = false
              if (item.menus) {
                l2MenuVisible = true
              }
              this.$emit('update:l2MenuVisible', l2MenuVisible)
              break
            } else {
              this.currentMenu = {}
              this.$emit('update:l2MenuVisible', false)
            }
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    getMenuHidden (menu) {
      if (menu.meta.hidden) {
        if (R.is(Function, menu.meta.hidden)) {
          return !menu.meta.hidden(this.userInfo)
        }
        if (R.is(Function, menu.meta.invisible)) {
          return !menu.meta.invisible(this.userInfo)
        }
        return false
      }
      return true
    },
    showMenu (item) {
      const hidden = this.getMenuHidden(item)
      if (R.isNil(item.meta.permission) || R.isEmpty(item.meta.permission)) {
        return hidden && true
      }
      return hidden && hasPermission({ key: item.meta.permission })
    },
    ghostL2ChangeHandle (item) {
      // 首次如果hover的是当前显示的菜单，则直接return
      if (R.isEmpty(this.ghostL2Menu) && item.index === this.currentMenu.index) return
      this.ghostL2Menu = item
    },
    handleMouseLeave () {
      this.ghostL2Menu = {}
    },
    setGhostL2MenuScrollTop (val) {
      this.ghostL2MenuScrollTop = val
    },
  },
}
</script>

<style lang="scss" scoped>
.sidebar-wrap {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  z-index: 98;
}
.slide-fade-enter-active {
  transition: all .1s ease;
}
.slide-fade-leave-active {
  transition: none;
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}
</style>

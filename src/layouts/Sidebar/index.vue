<template>
  <div class="sidebar-wrap">
    <level1-menu :menuitems="menuitems" :show-menu="showMenu" />
    <level2-menu ref="level2menu" :current-menu="currentMenu" :show-menu="showMenu" :visible="l2MenuVisible" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Level1Menu from './level-1-menu'
import Level2Menu from './level-2-menu'
import { menusConfig } from '@/router/routes'

const R = require('ramda')

export default {
  name: 'Sidebar',
  componentName: 'Sidebar',
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
      // 当前路由所匹配的菜单
      currentMenu: {},
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  watch: {
    $route: {
      handler (val, oldVal) {
        const newParentPath = val.matched[0]['path']
        const oldParentPath = oldVal && oldVal.matched && oldVal.matched[0]['path']
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
        return false
      }
      return true
    },
    showMenu (item) {
      const hidden = this.getMenuHidden(item)
      return hidden
    },
  },
}
</script>

<style lang="scss" scoped>
.sidebar-wrap {
  position: fixed;
  top: 60px;
  left: 0;
  height: 100%;
  z-index: 98;
}
</style>

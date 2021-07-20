<template>
  <scrollbar class="products-list-wrap" :class="{ 'light-theme': light }" id="products-list-wrap">
    <ul class="list-unstyled p-0 mb-0">
      <template v-for="(item, idx) of menus">
        <products-list-sub
          :key="idx"
          :item="item"
          :active-menu="activeMenu"
          :popover-align="popoverAlign"
          :get-label="getLabel"
          :show-menu="showMenu"
          :light="light"
          @route-change="$emit('route-change')" />
      </template>
    </ul>
  </scrollbar>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import { menusConfig } from '@/router/routes'
import { hasPermission } from '@/utils/auth'
import ProductsListSub from './Sub'

export default {
  name: 'ProductsList',
  components: {
    ProductsListSub,
  },
  props: {
    activeMenu: Object,
    popoverAlign: Object,
  },
  data () {
    return {
      menuitems: menusConfig,
    }
  },
  computed: {
    ...mapGetters(['theme']),
    light () {
      return this.theme === 'light'
    },
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
  },
}
</script>

<style lang="less">
@import "../../styles/less/theme";

.products-list-wrap {
  height: 100%;
  background-color: @sidebar-dark-bg-color;
  .scrollbar-wrap {
    overflow-x: hidden;
  }
  &.light-theme {
    background-color: @sidebar-light-bg-color;
    .l1-menu-item {
      > a {
        color: @sidebar-light-text-color;
      }
      &:hover {
        background-color: @primary-1;
        > a {
          color: @sidebar-light-hover-text-color;
        }
      }
      &.active {
        background-color: @primary-1 !important;
        > a {
          color: @sidebar-light-active-text-color;
        }
      }
    }
  }
}
.l1-menu-item {
  > a {
    height: 44px;
    color: @sidebar-dark-text-color;
  }
  .l1-menu-item-icon {
    width: 64px;
    height: 24px;
    text-align: center;
    > i {
      font-size: 24px;
    }
  }
  .l1-menu-item-right-icon {
    width: 26px;
    text-align: left;
    > i {
      font-size: 12px;
    }
  }
  &:hover {
    background-color: @primary-color;
    > a {
      color: @sidebar-dark-hover-text-color;
    }
  }
  &.active {
    background-color: @primary-7 !important;
    > a {
      color: @sidebar-dark-active-text-color;
    }
  }
}
</style>

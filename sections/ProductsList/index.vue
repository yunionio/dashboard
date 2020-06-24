<template>
  <scrollbar class="products-list-wrap">
    <ul class="list-unstyled p-0 mb-0">
      <template v-for="(item, idx) of menus">
        <!-- 含有子菜单 -->
        <template v-if="item.menus">
          <a-dropdown
            :key="idx"
            placement="bottomLeft"
            overlayClassName="l2-menus-dropdown"
            :align="dropdownAlign">
            <li class="l1-menu-item" :class="{ active: activeMenu.index === item.index }">
              <a class="d-flex align-items-center">
                <div class="l1-menu-item-icon">
                  <icon :type="item.meta.icon" />
                </div>
                <div class="l1-menu-item-label flex-fill text-truncate mr-2">{{ getLabel(item.meta) }}</div>
                <div class="l1-menu-item-right-icon">
                  <a-icon type="right" />
                </div>
              </a>
            </li>
            <template slot="overlay">
              <a-menu class="l2-menus-list">
                <template v-for="(l2, l2idx) of getL2Menus(item.menus)">
                  <a-menu-item :key="l2idx" class="l2-menus-list-item">
                    <router-link class="text-truncate" :to="l2.path" @click.native="() => $emit('route-change')">{{ getLabel(l2.meta) }}</router-link>
                  </a-menu-item>
                </template>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
        <!-- 无子菜单 -->
        <template v-else>
          <li :key="idx" class="l1-menu-item" :class="{ active: activeMenu.index === item.index }">
            <router-link
              class="d-flex align-items-center"
              :to="item.menu.path"
              @click.native="() => $emit('route-change')">
              <div class="l1-menu-item-icon">
                <icon :type="item.meta.icon" />
              </div>
              <div class="l1-menu-item-label flex-fill text-truncate mr-2">{{ getLabel(item.meta) }}</div>
            </router-link>
          </li>
        </template>
      </template>
    </ul>
  </scrollbar>
</template>

<script>
import * as R from 'ramda'
import { menusConfig } from '@/router/routes'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'ProductsList',
  props: {
    activeMenu: Object,
    dropdownAlign: Object,
  },
  data () {
    return {
      menuitems: menusConfig,
    }
  },
  computed: {
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
      return meta.label
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
    getL2Menus (menus) {
      const ret = []
      for (let i = 0, len = menus.length; i < len; i++) {
        const item = menus[i]
        if (this.showMenu(item)) {
          if (item.submenus) {
            for (let j = 0, jlen = item.submenus.length; j < jlen; j++) {
              const submenu = item.submenus[j]
              if (this.showMenu(submenu)) {
                ret.push(submenu)
              }
            }
          } else {
            ret.push(item)
          }
        }
      }
      return ret
    },
  },
}
</script>

<style lang="scss">
.products-list-wrap {
  height: 100%;
  background-color: #092c4d;
  .scrollbar-wrap {
    overflow-x: hidden;
  }
}
.l1-menu-item {
  > a {
    height: 44px;
    color: #fff;
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
    background-color: #00599c;
  }
  &.active {
    background-color: #007fdf !important;
  }
}
.l2-menus-dropdown {
  padding: 0;
  .l2-menus-list {
    max-height: calc(100vh - 60px);
    overflow: auto;
    min-width: 180px;
    max-width: 180px;
  }
}
</style>

<template>
  <div class="level-2-wrap">
    <scrollbar
      class="level-2-menu">
      <div class="title">{{ label }}</div>
      <div
        class="level-3-item"
        v-for="(citem, cidx) of menus"
        :key="cidx">
        <div
          class="group-menu"
          v-if="citem.submenus">
          <div class="level-3-group-title">{{ getLabel(citem.meta) }}</div>
          <router-link
            v-for="(sitem, sidx) of citem.submenus"
            v-show="showMenu(sitem)"
            :key="sidx"
            class="menu-item"
            :to="sitem.path"
            tag="a"
            active-class="active">
            {{ getLabel(sitem.meta) }}
          </router-link>
        </div>
        <router-link
          v-else
          class="menu-item"
          :to="citem.path"
          tag="a"
          active-class="active">
          {{ getLabel(citem.meta) }}
        </router-link>
      </div>
    </scrollbar>
  </div>
</template>

<script>
import * as R from 'ramda'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'Level2Menu',
  props: {
    l2Menu: {
      type: Object,
      required: true,
    },
  },
  computed: {
    label () {
      return this.l2Menu.meta.label
    },
    menus () {
      const menus = this.l2Menu.menus
      const res = []
      menus.forEach(m2item => {
        const m2 = { ...m2item }
        if (this.showMenu(m2)) {
          if (m2.submenus) {
            let flag = false
            const submenus = []
            m2.submenus.forEach(m3item => {
              if (this.showMenu(m3item)) {
                submenus.push(m3item)
                flag = true
              }
            })
            if (flag) {
              m2.submenus = submenus
              res.push(m2)
            }
          } else {
            res.push(m2)
          }
        }
      })
      return res
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
  },
}
</script>

<style lang="scss" scoped>
.level-2-wrap {
  position: fixed;
  left: 0;
  width: 160px;
  top: 60px;
  bottom: 0;
  background-color: rgb(66, 86, 111);
  box-shadow: 1px 0 6px 0 rgba(165,192,207,.3);
  ::v-deep {
    .scrollbar-wrap {
      overflow-x: hidden;
    }
  }
}

.level-2-menu {
  width: 100%;
  height: 100%;
  font-size: 14px;
  color: #fff;
  transition: left .2s;
  padding: 24px 0 0 23px;
  .title {
    color: #fff;
    font-size: 18px;
    margin-bottom: 16px;
  }
}

.level-3-item {
  .group-menu {
    margin-bottom: 10px;
  }
  .level-3-group-title {
    font-size: 12px;
    color: rgb(238,238,238);
    line-height: 24px;
    margin-left: 3px;
    margin-bottom: 14px;
    margin-top: 14px;
  }
  .menu-item {
    display: block;
    padding-bottom: 4px;
    padding-top: 6px;
    padding-left: 20px;
    font-size: 14px;
    color: #fff;
    position: relative;
    cursor: pointer;
    &::after {
      position: absolute;
      content: '';
      left: 0;
      top: 0;
      height: 100%;
      width: 1px;
      background-color: rgb(98,126,162);
      transition: width .2s ease;
    }
    &:hover, &.active {
      text-decoration: none;
      &::after {
        width: 4px;
        background-color: rgb(54,137,247);
      }
    }
  }
  > .menu-item {
    margin-bottom: 25px;
  }
  & + & {
    > .menu-item {
      margin-top: 25px;
    }
  }
}
</style>

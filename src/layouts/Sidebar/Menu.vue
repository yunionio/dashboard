<template>
  <div class="level-2-wrap" :class="{ 'light-theme': light, 'w-0': !l2MenuVisibleForStore }">
    <scrollbar
      class="level-2-menu">
      <div class="title text-truncate pr-2" :title="getLabel(l2Menu.meta)">{{ getLabel(l2Menu.meta) }}</div>
      <div
        class="level-3-item"
        v-for="(citem, cidx) of menus"
        :key="cidx">
        <div
          class="group-menu"
          v-if="citem.submenus">
          <div class="level-3-group-title text-truncate pr-2" :title="getLabel(citem.meta)">{{ getLabel(citem.meta) }}</div>
          <router-link
            v-for="(sitem, sidx) of citem.submenus"
            v-show="showMenu(sitem)"
            :key="sidx"
            class="menu-item text-truncate pr-2"
            :to="sitem.path"
            :title="getLabel(sitem.meta)"
            tag="a"
            active-class="active">
            {{ getLabel(sitem.meta) }}
          </router-link>
        </div>
        <router-link
          v-else
          class="menu-item text-truncate pr-2"
          :to="citem.path"
          :title="getLabel(citem.meta)"
          tag="a"
          active-class="active">
          {{ getLabel(citem.meta) }}
        </router-link>
      </div>
    </scrollbar>
    <div class="level-2-menu-collapse" @click="$store.commit('setting/SET_L2_MENU_VISIBLE', !l2MenuVisibleForStore)">
      <div class="level-2-menu-collapse-bg" />
      <div class="level-2-menu-collapse-icon d-flex align-items-center">
        <a-icon type="left" style="font-size: 12px;" v-show="l2MenuVisibleForStore" />
        <a-icon type="right" style="font-size: 12px;" v-show="!l2MenuVisibleForStore" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
    ...mapGetters(['theme']),
    light () {
      return this.theme === 'light'
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
    l2MenuVisibleForStore () {
      return this.$store.state.setting.l2MenuVisible
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

<style lang="less" scoped>
@import "../../styles/less/theme";

.level-2-wrap {
  position: fixed;
  left: 0;
  width: 160px;
  top: 60px;
  bottom: 0;
  background-color: @sidebar-dark-bg-color;
  box-shadow: 1px 0 6px 0 rgba(165,192,207,.3);
  z-index: 5;
  transition: width .2s ease;
  ::v-deep {
    .scrollbar-wrap {
      overflow-x: hidden;
    }
  }
  &.light-theme {
    background-color: @sidebar-light-bg-color;
    .level-2-menu {
      .title {
        color: #333;
      }
    }
    .level-3-item {
      .level-3-group-title {
        color: rgba(0, 0, 0, .7);
      }
      .menu-item {
        color: @sidebar-light-text-color;
        &::after {
          background-color: @primary-2;
        }
        &:hover, &.active {
          &::after {
            background-color: @primary-3;
          }
        }
        &:hover {
          color: @sidebar-light-hover-text-color;
        }
        &.active {
          color: @sidebar-light-active-text-color;
        }
      }
    }
  }
  &.w-0 {
    width: 0;
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
    color: rgba(255, 255, 255, .7);
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
    color: @sidebar-dark-text-color;
    position: relative;
    cursor: pointer;
    &::after {
      position: absolute;
      content: '';
      left: 0;
      top: 0;
      height: 100%;
      width: 1px;
      background-color: @primary-3;
      transition: width .2s ease;
    }
    &:hover, &.active {
      text-decoration: none;
      &::after {
        width: 4px;
        background-color: @primary-color;
      }
    }
    &:hover {
      color: @sidebar-dark-hover-text-color;
    }
    &.active {
      color: @sidebar-dark-active-text-color;
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
.level-2-menu-collapse {
  position: absolute;
  height: 66px;
  width: 12px;
  top: 50%;
  right: -12px;
  cursor: pointer;
  .level-2-menu-collapse-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-bottom: 8px solid transparent;
    border-right: none;
    border-left: 12px solid #EBEBEB;
    border-top: 8px solid transparent;
    z-index: 1;
  }
  .level-2-menu-collapse-icon {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    background-color: transparent;
    color: #C1C1C1;
  }
  &:hover {
    .level-2-menu-collapse-bg {
      border-left-color: #DEDEDE;
    }
    .level-2-menu-collapse-icon {
      color: #888;
    }
  }
}
</style>

<template>
  <div class="onecloud-map-wrap">
    <div class="mb-2 onecloud-map-header">
      <a-input v-model="search" class="w-100" :placeholder="$t('common_229')">
        <template v-slot:prefix>
          <a-icon type="search" />
        </template>
      </a-input>
    </div>
    <!-- 最近访问 -->
    <template v-if="recentMaps && recentMaps.length">
      <div class="mb-4 mt-4 onecloud-map-recent-wrap">
        <div class="font-weight-bold mb-2 map-recent-label">{{$t('common_230')}}</div>
        <div class="onecloud-map-recent-list">
          <template v-for="item of recentMaps">
            <div class="onecloud-map-recent-item" :key="item.path">
              <div>
                <router-link :to="item.path" class="recent-link text-truncate" :title="getLabel(item.meta)" @click.native="() => handleClick(item)">{{ getLabel(item.meta) }}</router-link>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
    <!-- 全部菜单 -->
    <template v-if="maps && maps.length">
      <div class="onecloud-map-body">
        <template v-for="(item, idx) of maps">
          <div class="onecloud-map-sub-wrap mb-4" :key="idx">
            <sub-map
              :sub="item"
              :search="search"
              :show-menu="showMenu"
              :get-label="getLabel"
              :get-search-match="getSearchMatch"
              @click="handleClick" />
          </div>
        </template>
      </div>
    </template>
    <!-- 未匹配到搜索结果 -->
    <template v-if="search && !maps.length">
      <div class="map-not-found-tips d-flex align-items-center mt-4">{{$t('common_231')}}<a-tag color="red" class="ml-1 mr-1">{{ search }}</a-tag>{{$t('common_232')}}</div>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapState } from 'vuex'
import { menusConfig } from '@/router/routes'
import { hasPermission } from '@/utils/auth'
import storage from '@/utils/storage'
import SubMap from './SubMap'

export default {
  name: 'OneCloudMap',
  components: {
    SubMap,
  },
  data () {
    return {
      maps: [],
      search: '',
      recentMaps: [],
    }
  },
  computed: {
    ...mapState('common', {
      recentMenus: state => state.recentMenus,
    }),
  },
  watch: {
    search (val) {
      this.$nextTick(() => {
        this.genMaps()
      })
    },
    recentMenus (val) {
      this.$nextTick(() => {
        this.genMaps()
      })
    },
  },
  created () {
    this.genMaps()
  },
  methods: {
    genMaps () {
      const maps = []
      const recentMaps = []
      R.forEach(l1 => {
        // 含有menus的进入筛选
        if (l1.menus && this.showMenu(l1)) {
          R.forEach(l2 => {
            // 是否要显示的标识
            let show = false
            // 含有submenus的进入筛选
            if (l2.submenus && this.showMenu(l2)) {
              R.forEach(l3 => {
                // 当有一个3级菜单符合条件时，则显示2级菜单
                // 搜索字符包含2级菜单或3级菜单信息则显示2级菜单
                if (this.showMenu(l3)) {
                  const recentItem = R.find(R.propEq('path', l3.path))(this.recentMenus)
                  if (recentItem) {
                    recentMaps.push(recentItem)
                  }
                  if (this.getSearchMatch(l2) || this.getSearchMatch(l3)) {
                    show = true
                  }
                }
              }, l2.submenus)
            }
            if (show) {
              maps.push(l2)
            }
          }, l1.menus)
        }
      }, menusConfig)
      recentMaps.sort((a, b) => {
        const aIndex = R.findIndex(R.propEq('path', a.path))(this.recentMenus)
        const bIndex = R.findIndex(R.propEq('path', b.path))(this.recentMenus)
        return aIndex - bIndex
      })
      this.maps = maps
      this.recentMaps = recentMaps
    },
    getLabel (meta) {
      if (meta.t) {
        return this.$t(meta.t)
      }
      if (meta.labelAlias) {
        return meta.labelAlias
      }
      return meta.label
    },
    getSearchMatch (menu) {
      if (this.search) {
        // let label = menu.meta.label
        // if (menu.meta.t) {
        //   label = this.getLabel(menu.meta)
        // }
        let label = this.getLabel(menu.meta)
        label = label.toLowerCase()
        return label.includes(this.search.toLowerCase())
      }
      return true
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
    handleClick (item) {
      this.$emit('click')
      this.$nextTick(() => {
        let menus = this.$store.getters.common.recentMenus
        const newRecent = {
          meta: item.meta,
          path: item.path,
        }
        const index = R.findIndex(R.propEq('path', newRecent.path))(menus)
        if (index !== -1) {
          menus = R.remove(index, 1, menus)
        }
        menus = R.prepend(newRecent, menus)
        if (menus.length > 8) {
          menus = R.slice(0, 8, menus)
        }
        storage.set('__oc_recent_menus__', menus)
        this.$store.dispatch('common/updateObject', {
          name: 'recentMenus',
          data: menus,
        })
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import "../../styles/less/theme";

.onecloud-map-header {
  padding: 20px 30px 0;
}
.onecloud-map-body {
  column-count: 4;
  column-gap: 10px;
  padding: 20px 25px;
}
.onecloud-map-sub-wrap {
  break-inside: avoid;
}
.onecloud-map-recent-list {
  column-count: 4;
  column-gap: 10px;
  padding: 0 25px;
}
.onecloud-map-recent-item {
  break-inside: avoid;
}
.map-recent-label {
  padding: 0px 30px;
}
.recent-link {
  padding: 5px 5px;
  display: block;
  font-size: 13px;
  color: @text-color-secondary;
  text-decoration: none;
  transition: all 300ms ease 0s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}
.map-not-found-tips {
  padding: 0 30px;
}
</style>

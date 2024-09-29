<template>
  <scrollbar class="products-sub-wrap p-3">
    <div class="products-header p-3">
      <!-- 总分类 -->
      <div class="products-title-wrap">
        <div class="products-title">{{ productTitle }}</div>
        <div class="close"><a-icon type="close" @click="close" /></div>
      </div>
      <!-- 搜索 -->
      <div class="search-wrap mt-3">
        <icon class="search-icon" type="search" />
        <a-input class="search" type="search" v-model="search" allowClear :placeholder="$t('common.function_search')" />
      </div>
    </div>
    <div class="none mb-4" style="margin-top:115px" />
    <!-- 最近访问 -->
    <div v-if="nearModule.menus.length" class="recent-module pb-4">
      <div class="recent-title">{{ nearModule.title }}</div>
      <div class="recent-list d-flex">
        <div v-for="item in nearModule.menus" :key="item.path" class="recent-item d-flex align-items-center" :class="{ 'stared': item.stared }" @click="hanldeRouterChange(item)">
          <div class="link">{{ item.title }}</div>
          <div class="icon" @click="(e) => handleStar(e, item)">
            <icon :type="item.stared ? 'stared' : 'star'" />
          </div>
        </div>
      </div>
    </div>
    <!-- 查找结果 -->
    <div v-if="search" class="result-wrap mt-4 mb-4">
      <span class="search-text">{{ search }}</span>:
      {{ searchValueCount ? $t('common.search_result_num', [searchValueCount]) : $t('common.search_result_none') }}
    </div>
    <!-- 模块 -->
    <div class="module-wrap mt-3 mb-3">
      <div v-for="(m, index) in moduleList.list" :key="index">
        <div v-if="showModuleTitle" class="d-flex align-items-center mb-3">
          <span class="module-title">{{ m.title }}</span>
          <div class="line" />
        </div>
        <div class="module-list pb-4">
          <div v-for="(moduleItem, index2) in m.menus" :key="`${index}-${index2}`" class="module-item">
            <div class="module-item-title">{{ moduleItem.title }}</div>
            <div v-for="(item, index3) in moduleItem.submenus" :key="`${index}-${index2}-${index3}`" class="module-item-link d-flex align-items-center" :class="{ 'stared': item.stared }" @click="hanldeRouterChange(item)">
              <div class="link">{{ item.title }}</div>
              <div class="icon" @click="(e) => handleStar(e, item)">
                <icon :type="item.stared ? 'stared' : 'star'" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </scrollbar>
</template>

<script>
import * as R from 'ramda'
import { mapState } from 'vuex'

export default {
  name: 'ProductsSubList',
  props: {
    activeMenu: Object,
    menus: Array,
  },
  data () {
    return {
      search: '',
    }
  },
  computed: {
    ...mapState('common', {
      staredList: state => state.sidebar.staredList,
      recentList: state => state.sidebar.recentList,
    }),
    productTitle () {
      return this.activeMenu?.index === 1 ? this.$t('common.product_service') : this.getLabel(this.activeMenu?.meta || {})
    },
    showModuleTitle () {
      return this.activeMenu.index === 1
    },
    nearModule () {
      const ret = {
        title: this.$t('common.recent_visit'),
        menus: this.moduleList.menus.filter(item => this.recentList.includes(item.path)),
      }
      ret.menus.sort((a, b) => {
        const aIdx = this.recentList.indexOf(a.path)
        const bIdx = this.recentList.indexOf(b.path)
        return aIdx - bIdx
      })
      return ret
    },
    moduleList () {
      const ls = this.menus.filter(item => {
        return item.index !== 1 && (this.activeMenu.index === 1 ? true : item.index === this.activeMenu.index)
      })
      const list = []
      const menus = []
      ls.map(item => {
        const lsItem = {
          title: this.getLabel(item.meta),
          menus: [],
        }
        if (item.menus) {
          item.menus.map(menu => {
            const menuItem = {
              title: this.getLabel(menu.meta),
              submenus: [],
            }
            if (menu.submenus) {
              menu.submenus.map(submenu => {
                const l = {
                  title: this.getLabel(submenu.meta),
                  path: submenu.path,
                  stared: this.staredList.includes(submenu.path),
                }
                if (!this.search || l.title.includes(this.search)) {
                  menuItem.submenus.push(l)
                  menus.push(l)
                }
              })
            }
            if (menuItem.submenus.length > 0) {
              lsItem.menus.push(menuItem)
            }
          })
        }
        if (lsItem.menus.length > 0) {
          list.push(lsItem)
        }
      })
      return { list, menus }
    },
    searchValueCount () {
      let count = 0
      this.moduleList.list.map(item => {
        item.menus.map(menuItem => {
          count += menuItem.submenus.length
        })
      })
      return count
    },
  },
  methods: {
    getLabel (meta) {
      if (meta.t) {
        return this.$t(meta.t)
      }
      return R.is(Function, meta.label) ? meta.label() : meta.label
    },
    close () {
      this.$emit('close')
    },
    hanldeRouterChange (menu) {
      this.$emit('routerChange', menu)
      this.$emit('close')
    },
    handleStar (e, menu) {
      e.stopPropagation()
      let list = this.staredList
      if (list.includes(menu.path)) {
        list = list.filter(item => item !== menu.path)
      } else {
        list.unshift(menu.path)
      }
      this.$emit('updateStaredMenu', list)
    },
  },
}
</script>

<style lang="less" scoped>
.products-sub-wrap {
  flex: 1;
  position: relative;
  .products-header {
    position: absolute;
    width: 100%;
    background: #fff;
    height: 110px;
    left: 0;
    top: 0;
    .products-title-wrap {
      display: flex;
      width: 100%;
      .products-title {
        width: 100%;
        flex: 1;
        font-size: 16px;
        font-weight: 500;
      }
      .close {
        flex: 0 0 20px;
        font-size: 18px;
        font-weight: 200;
      }
    }
    .search-wrap {
      position: relative;
      border-bottom: 1px solid #ebebeb;
      .search-icon {
        position: absolute;
        left: 5px;
        top: 9px;
      }
      .search {
        width: 100;
        padding-left: 20px;
      }
      &::v-deep input {
        border: none !important;
        font-size: 12px !important;
        color: #606266 !important;
        outline: none !important;
      }
      &::v-deep input:focus {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
    }
  }

  // 最近访问
  .recent-module {
    font-size: 12px;
    .recent-title {
      padding: 8px;
      color: black;
      font-weight: bold;
    }
    .recent-list {
      flex-wrap: wrap;
      .recent-item {
        flex: 0 0 33.33%;
        width: 33.33%;
      }
    }
  }

  .result-wrap {
    font-size: 12px;
    .search-text {
      display: inline-block;
      padding: 3px 5px;
      color: var(--antd-wave-shadow-color);
      background: #ebebeb;
      border-radius: 3px;
    }
  }

  .module-wrap {
    .module-title {
      font-size: 14px;
      font-weight: 500;
      margin-right: 10px;
    }
    .line {
      border-top: 1px solid #ebebeb;
      flex: 1;
    }
    .module-list {
      font-size: 12px;
      columns: auto 3;
      .module-item {
        break-inside: avoid;
        .module-item-title {
          padding: 8px;
          color: black;
          font-weight: bold;
        }
      }
    }
  }
}
.module-item-link, .recent-item {
  padding: 8px;
  color: #666;
  cursor: pointer;
  transition: all ease-in-out 0.1s;
  .link {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .icon {
    opacity: 0;
    flex: 0 0 12px;
    font-size: 13px;
    color: var(--antd-wave-shadow-color);
    font-weight: bolder;
    transition: all ease-in-out 0.1s;
  }
  &:hover {
    background: #ebebeb;
    .icon {
      opacity: 1;
    }
  }
}
.stared {
  .icon {
    opacity: 1;
  }
}
</style>

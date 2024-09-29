<template>
  <a-drawer
    placement="left"
    id="sidebar-wrap"
    :closable="false"
    :visible="drawerVisible"
    :z-index="98"
    :width="1000"
    :body-style="{ paddingTop: '60px', paddingLeft: 0, paddingRight: 0, paddingBottom: 0, height: '100%' }"
    @close="handleClose">
    <div class="sidebar-wrap">
      <products-list
        ref="productsList"
        @route-change="handleClose"
        :active-menu="activeMenu"
        :popover-align="{ offset: [5, 5] }"
        :menus="menus"
        :staredMenus="staredMenus"
        @close="handleClose"
        @activeMenuChange="handleActiveMenuChange"
        @updateStaredMenu="handleUpdateStaredMenu"
        @routerChange="handleRouterChange" />
      <products-sub-list
        :menus="menus"
        :active-menu="activeMenu"
        @close="handleClose"
        @updateStaredMenu="handleUpdateStaredMenu"
        @routerChange="handleRouterChange" />
    </div>
  </a-drawer>
</template>

<script>
import * as R from 'ramda'
import get from 'lodash/get'
import { mapGetters } from 'vuex'
import ProductsList from '@/sections/ProductsList'
import ProductsSubList from '@/sections/ProductsSubList'
import { menusConfig } from '@/router/routes'

export default {
  name: 'Sidebar',
  components: {
    ProductsList,
    ProductsSubList,
  },
  props: {
    // activeMenu: Object,
    menus: Array,
    staredMenus: Array,
  },
  data () {
    return {
      width: 200,
      menuitems: menusConfig,
      activeMenu: { index: 1 },
    }
  },
  computed: {
    ...mapGetters(['common']),
    sidebar () {
      return this.common.sidebar
    },
    drawerVisible () {
      return get(this.common, 'sidebar.drawerVisible', false)
    },
  },
  methods: {
    handleActiveMenuChange (menu) {
      this.activeMenu = menu
    },
    getLabel (meta) {
      if (meta.t) {
        return this.$t(meta.t)
      }
      return R.is(Function, meta.label) ? meta.label() : meta.label
    },
    handleClose () {
      // this.$refs.productsList.closeSubMenu()
      this.$store.dispatch('common/updateObject', {
        name: 'sidebar',
        data: {
          drawerVisible: false,
        },
      })
    },
    handleUpdateStaredMenu (staredList) {
      this.$store.dispatch('common/updateObject', {
        name: 'sidebar',
        data: {
          staredList,
        },
      })
      this.$store.dispatch('profile/update', {
        staredList,
      })
    },
    handleRouterChange (menu) {
      this.$emit('routerChange', menu)
    },
  },
}
</script>

<style lang="less" scoped>
.sidebar-wrap {
  width: 1000px;
  height: 100%;
  display: flex;
}
</style>

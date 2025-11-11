<template>
  <a-drawer
    placement="left"
    id="sidebar-wrap"
    :closable="false"
    :visible="drawerVisible"
    :z-index="98"
    :width="width"
    :body-style="wrapStyle"
    @close="handleClose">
    <products-list @route-change="handleClose" :active-menu="activeMenu" :popover-align="{ offset: [5, 5] }" />
  </a-drawer>
</template>

<script>
import get from 'lodash/get'
import { mapGetters, mapState } from 'vuex'
import ProductsList from '@/sections/ProductsList'

export default {
  name: 'Sidebar',
  components: {
    ProductsList,
  },
  props: {
    activeMenu: Object,
  },
  data () {
    return {
      width: 200,
    }
  },
  computed: {
    ...mapGetters(['common']),
    ...mapState('common', {
      openCloudShell: state => state.openCloudShell,
      cloudShellHeight: state => state.cloudShellHeight,
    }),
    sidebar () {
      return this.common.sidebar
    },
    drawerVisible () {
      return get(this.common, 'sidebar.drawerVisible', false)
    },
    wrapStyle () {
      const style = { paddingTop: '60px', paddingLeft: 0, paddingRight: 0, paddingBottom: 0, height: '100%' }
      if (this.openCloudShell) {
        style.height = `calc(100% - ${this.cloudShellHeight}px)`
      }
      return style
    },
  },
  methods: {
    handleClose () {
      this.$store.dispatch('common/updateObject', {
        name: 'sidebar',
        data: {
          drawerVisible: false,
        },
      })
    },
  },
}
</script>

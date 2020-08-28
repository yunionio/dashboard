<template>
  <a v-if="isLink && !inBaseDialog" @click="clickHandle"><slot /></a>
  <span v-else><slot /></span>
</template>

<script>
import * as R from 'ramda'
import config from './config/index.js'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'SidePageTrigger',
  props: {
    vm: {
      type: Object,
    },
    list: {
      type: Object,
    },
    name: {
      type: String,
    },
    id: {
      type: String,
    },
    tab: {
      type: String,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    permission: {
      type: String,
    },
  },
  inject: {
    // 是否处于List中
    inList: {
      default: false,
    },
    // 是否处于SidePage中
    inBaseSidePage: {
      default: false,
    },
    // 是否处于Dialog中
    inBaseDialog: {
      default: false,
    },
  },
  computed: {
    isLink () {
      const { globalSidePages } = this.$store.state.common
      return hasPermission({ key: this.permission }) && (globalSidePages.names.indexOf(this.name) > -1 || !this.name)
    },
  },
  methods: {
    handlePropsTrigger () {
      this.$emit('trigger')
    },
    clickHandle () {
      if (this.$listeners.trigger) {
        this.updateSidepageLeft()
        this.handlePropsTrigger()
        return
      }
      if (this.name && this.id && this.vm) {
        this.updateSidepageLeft()
        const { name, id, vm, options, list, tab, params } = this
        vm.sidePageTriggerHandle(vm, name, {
          id,
          ...config[name],
          ...options,
        }, {
          list,
          ...params,
        })
        if (tab) {
          vm.initSidePageTab(tab)
        }
      }
    },
    findPageListTableByParent (vm) {
      if (vm.$options._componentTag === 'vxe-table') {
        return vm
      }
      if (vm.$parent) {
        return this.findPageListTableByParent(vm.$parent)
      }
    },
    updateSidepageLeft () {
      if (!this.inBaseSidePage && this.inList && this.$parent.field) {
        // column 的 right 值只需查找一次，查找后进行缓存，后续直接使用缓存
        if (!this.columnRightTemp) {
          const table = this.findPageListTableByParent(this.$parent)
          if (table) {
            const columns = table.getColumns()
            const fieldColumn = R.find(R.propEq('property', this.$parent.field))(columns)
            const colId = fieldColumn.id
            const $column = table.$el.querySelector(`.vxe-table--main-wrapper .vxe-table--body-wrapper .vxe-body--column[data-colid=${colId}]`)
            const columnRect = $column.getBoundingClientRect()
            let rightTemp = columnRect.right
            // 如果列宽超过150，则抽屉展开的位置定位在距离列150的位置
            if (columnRect.width > 150) {
              rightTemp = columnRect.left + 150
            }
            this.columnRightTemp = rightTemp
          }
        }
        this.$store.dispatch('sidePage/updateSidepageLeft', this.columnRightTemp)
      }
    },
  },
}
</script>

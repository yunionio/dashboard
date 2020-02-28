<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { STORAGE_TYPES, MEDIUM_TYPES } from '@Storage/constants/index.js'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getEnabledFilter, getStatusFilter, getBrandFilter } from '@/utils/common/tableFilter'

export default {
  name: 'BlockStorageList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'storages',
        // getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
          enabled: getEnabledFilter(),
          status: getStatusFilter({ statusModule: 'blockstorage' }),
          brand: getBrandFilter(),
          storage_type: {
            label: '存储类型',
            dropdown: true,
            multiple: true,
            items: Object.keys(STORAGE_TYPES).map(key => {
              return { label: STORAGE_TYPES[key], key }
            }),
          },
          medium_type: {
            label: '介质类型',
            dropdown: true,
            multiple: true,
            items: Object.keys(MEDIUM_TYPES).map(key => {
              return { label: STORAGE_TYPES[key], key }
            }),
          },
        },
      }),
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('BlockStorageCreateDialog', {
              title: '新建',
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '批量操作',
          actions: () => {
            return [
              {
                label: '启用',
                permission: 'storages_perform_enable',
                action: (row) => {
                  this.onManager('batchPerformAction', {
                    id: this.list.selectedItems.map(item => item.id),
                    managerArgs: {
                      action: 'enable',
                    },
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.selectedItems.some(item => !item.enabled),
                  }
                },
              },
              {
                label: '禁用',
                permission: 'storages_perform_disable',
                action: (row) => {
                  this.onManager('batchPerformAction', {
                    id: this.list.selectedItems.map(item => item.id),
                    managerArgs: {
                      action: 'disable',
                    },
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.selectedItems.some(item => item.enabled),
                  }
                },
              },
              {
                label: '删除',
                permission: 'storages_delete',
                action: row => {
                  this.createDialog('DeleteResDialog', {
                    title: '删除',
                    name: '块存储',
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            return {
              validate: !!this.list.selectedItems.length,
            }
          },
        },
      ],
      handleOpenSidepage (row) {
        this.sidePageTriggerHandle(this, 'BlockStorageSidePage', {
          id: row.id,
          resource: 'storages',
          getParams: this.getParam,
        }, {
          list: this.list,
        })
      },
    }
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('detail')
    this.$bus.$on('BlockStorageListSingleUpdate', args => {
      this.list.singleUpdate(...args)
    }, this)
  },
}
</script>

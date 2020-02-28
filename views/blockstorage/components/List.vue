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
<<<<<<< HEAD
=======
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'BlockStorageSidePage') }>{ row.name_cn ? `${row.name}(${row.name_cn})` : row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'capacity',
          title: '实际容量',
          width: 100,
          formatter: ({ row }) => {
            return sizestr(row.capacity, 'M', 1024)
          },
        },
        {
          field: 'vcapacity',
          title: '虚拟容量',
          width: 100,
          formatter: ({ row }) => {
            if (!row.vcapacity) return '-'
            return sizestr(row.vcapacity, 'M', 1024)
          },
          slots: {
            header: ({ column }) => {
              return [
                <a-tooltip title='虚拟容量 = 实际容量 * 超售比'>
                  <span class='mr-1'>{ column.title }</span>
                  <icon type="question" />
                </a-tooltip>,
              ]
            },
          },
        },
        {
          field: 'used',
          title: '分配',
          width: 100,
          formatter: ({ row }) => {
            if (!row.used) return '-'
            return sizestr(row.used, 'M', 1024)
          },
        },
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'blockstorage' }),
        {
          field: 'storage_type',
          title: '存储类型',
          width: 100,
          formatter: ({ row }) => {
            return STORAGE_TYPES[row.storage_type] || row.storage_type
          },
        },
        getBrandTableColumn(),
        {
          field: 'medium_type',
          title: '介质类型',
          width: 120,
          formatter: ({ row }) => {
            return MEDIUM_TYPES[row.medium_type] || row.medium_type
          },
        },
        {
          field: 'schedtag',
          title: '调度标签',
          width: 120,
          type: 'expand',
          slots: {
            content: ({ row }) => {
              let tags = _.sortBy(row.schedtags, ['default', 'name'])
              if (tags.length > 0) {
                return tags.map(tag => <a-tag class='mb-2' color='blue'>{tag.name}</a-tag>)
              }
              return [
                <div class='text-color-help'>无调度标签</div>,
              ]
            },
          },
        },
      ],
>>>>>>> 8ba1eb66f69e81a4a5759c0442746640b523345b
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

<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { STORAGE_TYPES, MEDIUM_TYPES } from '@Storage/constants/index.js'
import _ from 'lodash'
import { getNameDescriptionTableColumn, getEnabledTableColumn, getStatusTableColumn, getBrandTableColumn } from '@/utils/common/tableColumn'
import { getNameFilter, getEnabledFilter, getStatusFilter, getBrandFilter } from '@/utils/common/tableFilter'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BlockStorageList',
  mixins: [WindowsMixin],
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
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('BlockStorageCreateDialog', {
              title: '新建',
              list: this.list,
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
                  this.list.batchPerformAction('enable', null, '')
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
                  this.list.batchPerformAction('disable', null, '')
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
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    list: this.list,
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
      singleActions: [
        {
          label: '启用',
          permission: 'storages_perform_enable',
          action: (row) => {
            this.list.singlePerformAction('enable', { id: row.id })
          },
          meta: ({ enabled }) => {
            return {
              validate: !enabled,
            }
          },
        },
        {
          label: '禁用',
          permission: 'storages_perform_disable',
          action: (row) => {
            this.list.singlePerformAction('disable', { id: row.id })
          },
          meta: ({ enabled }) => {
            return {
              validate: enabled,
            }
          },
        },
        {
          label: '更多',
          actions: (row) => {
            return [
              {
                label: '关联宿主机',
                permission: 'storages_perform_storages',
                action: row => {
                  this.createDialog('AssociatedHostDialog', {
                    data: [row],
                    columns: this.columns,
                    title: '关联宿主机',
                    list: this.list,
                  })
                },
                meta: row => {
                  const validate = ['rbd', 'nfs', 'gpfs'].includes(row.storage_type)
                  return {
                    validate,
                    tooltip: !validate && 'Ceph、GPFS或NFS类型的存储支持该操作',
                  }
                },
              },
              {
                label: '调整容量',
                permission: 'storages_update_capacity',
                action: row => {
                  this.createDialog('BlockStorageUpdateCapacityDialog', {
                    data: [row],
                    columns: this.columns,
                    title: '调整容量',
                    list: this.list,
                  })
                },
                meta: row => {
                  return {
                    validate: row.provider === 'OpenStack',
                  }
                },
              },
              {
                label: '修改属性',
                permission: 'storages_update',
                action: row => {
                  this.createDialog('BlockStorageUpdateStorageDialog', {
                    data: [row],
                    columns: this.columns,
                    title: '修改属性',
                    list: this.list,
                  })
                },
              },
              {
                label: '调度标签',
                permission: 'storages_update',
                action: row => {
                  this.createDialog('BlockStorageUpdateTagsDialog', {
                    data: [row],
                    columns: this.columns,
                    title: '调度标签',
                    list: this.list,
                  })
                },
              },
              {
                label: '删除',
                permission: 'storages_delete',
                action: row => {
                  this.createDialog('DeleteResDialog', {
                    data: [row],
                    columns: this.columns,
                    title: '删除',
                    list: this.list,
                    name: '块存储',
                  })
                },
                meta: (row) => this.$getDeleteResult(row),
              },
            ]
          },
        },
      ],
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

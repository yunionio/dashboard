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
import { getNameFilter, getEnabledFilter, getStatusFilter } from '@/utils/common/tableFilter'
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
          status: getStatusFilter({ statusModule: 'blockStorage' }),
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
          field: 'virtual_capacity',
          title: '虚拟容量',
          width: 100,
          formatter: ({ row }) => {
            if (!row.virtual_capacity) return '-'
            return sizestr(row.virtual_capacity, 'M', 1024)
          },
        },
        {
          field: 'used_capacity',
          title: '分配',
          width: 100,
          formatter: ({ row }) => {
            if (!row.used_capacity) return '-'
            return sizestr(row.used_capacity, 'M', 1024)
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
          field: 'schedtag',
          title: '调度标签',
          width: 120,
          slots: {
            default: ({ row }) => {
              let tags = _.sortBy(row.schedtags, ['default', 'name'])
              return tags.map(tag => <a-tag color="blue">{tag.name}</a-tag>)
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
          label: '启用',
          permission: 'storages_perform_enable',
          action: (row) => {
            this.list.batchPerformAction('enable', null, '')
          },
          meta: () => {
            return {
              validate: !!this.list.selectedItems.length,
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
                  return {
                    validate: true,
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
                  })
                },
                meta: row => {
                  return {
                    validate: row.can_delete,
                  }
                },
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
  },
}
</script>

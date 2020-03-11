<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import { DISK_TYPES, STORAGE_TYPES } from '../constants'
import { RollbackDiskValidate } from '../validate'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import globalSearchMixins from '@/mixins/globalSearch'

export default {
  name: 'SnapshotList',
  mixins: [WindowsMixin, globalSearchMixins],
  props: {
    list: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '硬盘', key: 'disk_name' },
          { label: '磁盘类型', key: 'disk_type' },
          { label: '快照大小', key: 'size' },
          { label: '状态', key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'provider' },
          { label: '虚拟机', key: 'guest' },
          { label: '创建时间', key: 'create_at' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '存储方式', key: 'storage_type' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'SnapshotSidePage', { type: 'disk' }) }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getCopyWithContentTableColumn({
          field: 'disk_name',
          title: '硬盘',
        }),
        {
          field: 'disk_type',
          title: '磁盘类型',
          width: 70,
          formatter: ({ row }) => {
            return DISK_TYPES[row.disk_type] || row.disk_type
          },
        },
        {
          field: 'size',
          title: '快照大小',
          width: 70,
          formatter: ({ row }) => {
            return sizestr(row.size, 'M', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'snapshot' }),
        getProjectTableColumn(),
        getBrandTableColumn(),
        {
          field: 'guest',
          title: '虚拟机',
          minWidth: 70,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }, h) => {
              return [
                <div class='text-truncate'>
                  {row.guest ? <list-body-cell-wrap copy field='guest' row={row} /> : '-'}
                  {row.guest_status ? <status status={ row['guest_status'] } statusModule='server'/> : ''}
                </div>,
              ]
            },
          },
        },
        getTimeTableColumn(),
        {
          field: 'storage_type',
          title: '存储类型',
          width: 80,
          formatter: ({ row }) => {
            return STORAGE_TYPES[row.storage_type] || row.storage_type || '-'
          },
        },
      ],
      groupActions: [
        {
          label: '删除',
          permission: 'snapshots_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
              title: '删除',
              name: '快照',
            })
          },
          meta: () => {
            const ret = {
              validate: this.list.selected.length,
              tooltip: null,
            }
            if (this.list.selectedItems.some(item => !item.can_delete)) {
              ret.validate = false
              return ret
            }
            if (this.list.selectedItems.some(item => item.is_sub_snapshot)) {
              ret.validate = false
              ret.tooltip = '此快照为主机快照子快照，不可操作'
              return ret
            }
            return ret
          },
        },
      ],
      singleActions: [
        {
          label: '回滚硬盘',
          permission: 'disks_perform_disk_reset',
          action: obj => {
            this.createDialog('RollbackDiskDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => {
            const brand = obj.brand && obj.brand.toLowerCase()
            if (!obj.disk_name) {
              return { validate: false }
            }
            if (brand && RollbackDiskValidate[brand]) {
              return { ...RollbackDiskValidate[brand](obj) }
            }
            return { validate: true }
          },
        },
        {
          label: '删除',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除',
              list: this.list,
              name: '快照',
              success: () => {
                this.destroySidePages()
              },
            })
          },
          meta: obj => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('snapshot-detail')
    this.list.fetchData()
  },
}
</script>

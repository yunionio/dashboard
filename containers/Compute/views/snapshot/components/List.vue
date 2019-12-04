<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { DISK_TYPES, STORAGE_TYPES } from '../constants'
import { RollbackDiskValidate } from '../validate'
import {
  getNameDescriptionTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'

export default {
  name: 'SnapshotList',
  mixins: [WindowsMixin],
  props: {
    list: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'DiskSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getBrandTableColumn(),
        {
          field: 'disk_name',
          title: '硬盘',
          formatter: ({ row }) => {
            return row.disk_name
          },
        },
        {
          field: 'disk_type',
          title: '磁盘类型',
          formatter: ({ row }) => {
            return DISK_TYPES[row.disk_type] || row.disk_type
          },
        },
        {
          field: 'size',
          title: '快照大小',
          formatter: ({ row }) => {
            return sizestr(row.size, 'M', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'snapshot' }),
        getProjectTableColumn(),
        {
          field: 'guest',
          title: '虚拟机',
          slots: {
            default: ({ row }, h) => {
              return [
                <div>
                  {row.guest}
                  {row.guest_status ? <status status={ row['guest_status'] } statusModule='server'/> : ''}
                </div>,
              ]
            },
          },
        },
        {
          field: 'created_at',
          title: '创建时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        {
          field: 'storage_type',
          title: '存储类型',
          formatter: ({ row }) => {
            return STORAGE_TYPES[row.storage_type] || row.storage_type || '-'
          },
        },
      ],
      groupActions: [],
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
            const brand = obj.brand.toLowerCase()
            return { ...RollbackDiskValidate[brand](obj) }
          },
        },
      ],
    }
  },
  created () {
    // this.initSidePageTab('disk-detail')
    this.list.fetchData()
  },
}
</script>

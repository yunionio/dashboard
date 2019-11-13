<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import expectStatus from '@/constants/expectStatus'
import { getBrandTableColumn, getStatusTableColumn, getCopyWithContentTableColumn, getProjectTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DiskRecoveryList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'disks',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.server).flat(),
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
        {
          field: 'guest',
          title: '云服务器',
        },
        {
          field: 'disk_type',
          title: '类型',
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? '系统盘' : '数据盘'
          },
        },
        getStatusTableColumn({ statusModule: 'disk' }),
        getProjectTableColumn(),
        getBrandTableColumn(),
        {
          field: 'auto_delete_at',
          title: '自动清除时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
      ],
      groupActions: [
        {
          label: '清除',
          permission: 'disks_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '清除',
              list: this.list,
              requestParams: { override_pending_delete: true },
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
        {
          label: '恢复',
          permission: 'disks_perform_cancel_delete',
          action: () => {
            this.createDialog('DiskRestoreDialog', {
              title: '恢复',
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
      ],
      singleActions: [
        {
          label: '清除',
          permission: 'disks_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '清除',
              list: this.list,
              requestParams: { override_pending_delete: true },
            })
          },
          meta: obj => {
            return {
              validate: obj.can_delete,
            }
          },
        },
        {
          label: '恢复',
          permission: 'disks_perform_cancel_delete',
          action: (obj) => {
            this.createDialog('DiskRestoreDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => {
            return {
              validate: obj.status !== 'deleting',
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParams () {
      return {
        details: true,
        with_meta: true,
        pending_delete: true,
      }
    },
  },
}
</script>

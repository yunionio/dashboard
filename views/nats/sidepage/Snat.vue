<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import ListMixin from '@/mixins/list'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SNatList',
  mixins: [DialogMixin, WindowsMixin, ListMixin],
  props: {
    resId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'natsentries',
        getParams: {
          natgateway: this.resId,
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
        steadyStatus: Object.values(expectStatus.nat).flat(),
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'name',
          title: 'SNAT名称',
        }),
        {
          field: 'ip',
          title: '公网IP地址',
        },
        {
          field: 'sn',
          title: 'IP子网',
          formatter: ({ row }) => {
            if (row.network) {
              return `${row.network.name} (起:${row.network.guest_ip_start} 止:${row.network.guest_ip_end})`
            }
            return '-'
          },
        },
        getStatusTableColumn({ statusModule: 'nat' }),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'server_create',
          action: () => {
            this.createDialog('SNatCreateDialog', {
              title: '新建SNAT条目',
              data: this.data,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '删除',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除SNAT条目',
              onManager: this.onManager,
              name: 'SNAT条目',
              alert: '提示：请在删除前确认数据已备份，删除后数据无法找回',
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              title: '删除SNAT条目',
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
              name: 'SNAT条目',
              alert: '提示：请在删除前确认数据已备份，删除后数据无法找回',
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>

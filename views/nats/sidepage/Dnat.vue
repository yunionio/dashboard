<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import {
  getStatusTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import ListMixin from '@/mixins/list'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DNatList',
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
        resource: 'natdentries',
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
          field: 'real_name',
          title: 'DNAT名称',
        }),
        getCopyWithContentTableColumn({
          field: 'external_ip',
          title: '公网IP地址',
        }),
        {
          field: 'external_port',
          title: '公网端口',
          width: 80,
        },
        getCopyWithContentTableColumn({
          field: 'internal_ip',
          title: '内网IP地址',
        }),
        {
          field: 'ip_protocol',
          title: '协议类型',
          width: 80,
        },
        {
          field: 'internal_port',
          title: '内网端口',
          width: 80,
        },
        getStatusTableColumn({ statusModule: 'nat' }),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'server_create',
          action: () => {
            this.createDialog('DNatCreateDialog', {
              title: '新建DNAT条目',
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
              title: '删除DNAT条目',
              onManager: this.onManager,
              name: 'DNAT条目',
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
              title: '删除DNAT条目',
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
              name: 'DNAT条目',
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

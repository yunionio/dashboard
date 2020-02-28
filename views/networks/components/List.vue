<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import { typeClouds } from '@/utils/common/hypervisor'
import ListMixin from '@/mixins/list'

export default {
  name: 'NetworkList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
    serverColumns: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'networks',
        ctx: [['servers', this.resId]],
        idKey: 'index',
        getParams: {
          order_by: 'index',
          order: 'asc',
        },
      }),
      groupActions: [
        {
          label: '添加网卡',
          action: () => {
            this.createDialog('VmSetNetworkDialog', {
              title: '添加网卡',
              data: [this.data],
              columns: this.serverColumns,
              resId: this.resId,
              refresh: this.refresh,
              total: this.list.total,
            })
          },
          meta: () => {
            const isOneCloud = this.data.hypervisor === typeClouds.hypervisorMap.kvm.key
            return {
              buttonType: 'primary',
              validate: isOneCloud,
              tooltip: !isOneCloud && '只有OneCloud主机支持此操作',
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('event-drawer')
    this.list.fetchData()
  },
}
</script>

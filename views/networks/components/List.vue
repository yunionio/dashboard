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
    getParams: {
      type: Object,
      default: () => ({}),
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
          ...this.getParams,
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
            let tooltip = null
            if (!isOneCloud) {
              tooltip = '只有OneCloud主机支持此操作'
            }
            if (this.list.total >= 8) {
              tooltip = '网卡最多支持添加8个'
            }
            return {
              buttonType: 'primary',
              validate: isOneCloud && this.list.total < 8,
              tooltip,
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
  methods: {
    handleOpenNetworkDetail (id) {
      this.initSidePageTab('network-detail')
      this.sidePageTriggerHandle(this, 'NetworkSidePage', {
        id,
        resource: 'networks',
      })
    },
  },
}
</script>

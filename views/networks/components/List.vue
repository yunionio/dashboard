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
<<<<<<< HEAD
=======
      columns: [
        {
          field: 'index',
          title: '序号',
          width: 50,
          formatter: ({ row }) => {
            return row.index ? row.index : '0'
          },
        },
        getCopyWithContentTableColumn({ field: 'network', title: '网卡名称', sortable: true }),
        getCopyWithContentTableColumn({ field: 'mac_addr', title: 'MAC地址', sortable: true }),
        getCopyWithContentTableColumn({ field: 'ip_addr', title: 'IP地址', sortable: true }),
        getCopyWithContentTableColumn({ field: 'driver', title: '驱动' }),
        {
          field: 'bw_limit',
          title: '带宽限制',
          width: 100,
          formatter: ({ row }) => {
            return `${row.bw_limit}Mbps`
          },
          slots: {
            header: ({ column }) => {
              return [
                <a-tooltip title='"0"代表带宽没有限制'>
                  <span class='mr-1'>{ column.title }</span>
                  <icon type="question" />
                </a-tooltip>,
              ]
            },
          },
        },
      ],
      singleActions: [
        {
          label: '修改带宽',
          action: (obj) => {
            this.createDialog('VmChangeBandwidthDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
        },
        {
          label: '更换IP',
          action: (obj) => {
            this.createDialog('VmChangeIpDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
              zone: this.data.zone_id,
              resId: this.resId,
              hypervisor: this.data.hypervisor,
            })
          },
          meta: (obj) => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            if (isPrivate || isPublic) {
              ret.tooltip = '私有云、公有云不支持此操作'
              return ret
            }
            ret.validate = true
            return ret
          },
        },
      ],
>>>>>>> 21c43bc5a6f29dd4f4438061c7ef11056a134b2a
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

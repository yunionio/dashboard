<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { SERVER_TYPE } from '@Compute/constants'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { findPlatform, typeClouds } from '@/utils/common/hypervisor'

export default {
  name: 'NetworkList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
    serverColumns: {
      type: Array,
    },
  },
  data () {
    const type = findPlatform(this.data.hypervisor)
    const isPublic = type === SERVER_TYPE.private
    const isPrivate = type === SERVER_TYPE.public
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
      columns: [
        {
          field: 'index',
          title: '序号',
          width: 50,
          formatter: (data) => {
            return data.seq
          },
        },
        getCopyWithContentTableColumn({ field: 'ifname', title: '网卡名称', sortable: true }),
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
      groupActions: [
        {
          label: '添加网卡',
          action: () => {
            this.createDialog('VmSetNetworkDialog', {
              title: '添加网卡',
              list: this.list,
              data: [this.data],
              columns: this.serverColumns,
              resId: this.resId,
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
}
</script>

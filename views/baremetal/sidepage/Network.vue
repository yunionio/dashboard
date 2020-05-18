<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import { SERVER_TYPE } from '@Compute/constants'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'NetworkListForBaremetalSidepage',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
    getParams: {
      type: Object,
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
        idKey: 'network_id',
        getParams: this.getParams,
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
              refresh: this.refresh,
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
              refresh: this.refresh,
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
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>

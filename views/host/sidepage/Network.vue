<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
// import { SERVER_TYPE } from '@Compute/constants'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
// import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'NetworkList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    // const type = findPlatform(this.data.host_type)
    // const isPublic = type === SERVER_TYPE.private
    // const isPrivate = type === SERVER_TYPE.public
    return {
      list: this.$list.createList(this, {
        resource: 'networks',
        ctx: [['hosts', this.resId]],
        getParams: this.getParams,
        filterOptions: {
          network: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `network.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        {
          field: 'index',
          title: '序号',
          formatter: ({ row }) => {
            return row.index ? row.index : '0'
          },
        },
        // getCopyWithContentTableColumn({ field: 'network', title: '网卡名称', sortable: true }),
        getCopyWithContentTableColumn({ field: 'mac_addr', title: 'MAC地址', sortable: true }),
        getCopyWithContentTableColumn({ field: 'ip_addr', title: 'IP地址', sortable: true }),
        getCopyWithContentTableColumn({ field: 'driver', title: '驱动' }),
        getCopyWithContentTableColumn({
          field: 'network',
          title: 'IP子网',
          hideField: true,
          slotCallback: row => {
            return [
              <side-page-trigger permission='networks_get' name='NetworkSidePage' id={row.network_id} vm={this}>{ row.network }</side-page-trigger>,
            ]
          },
        }),
        // {
        //   field: 'bw_limit',
        //   title: '带宽限制',
        //   formatter: ({ row }) => {
        //     return `${row.bw_limit}Mbps`
        //   },
        //   slots: {
        //     header: ({ column }) => {
        //       return [
        //         <a-tooltip title='"0"代表带宽没有限制'>
        //           <span class='mr-1'>{ column.title }</span>
        //           <icon type="question" />
        //         </a-tooltip>,
        //       ]
        //     },
        //   },
        // },
      ],
      // singleActions: [
      //   {
      //     label: '修改带宽',
      //     action: (obj) => {
      //       this.createDialog('VmChangeBandwidthDialog', {
      //         data: [obj],
      //         columns: this.columns,
      //         list: this.list,
      //       })
      //     },
      //   },
      //   {
      //     label: '更换IP',
      //     action: (obj) => {
      //       this.createDialog('VmChangeIpDialog', {
      //         data: [obj],
      //         columns: this.columns,
      //         list: this.list,
      //         zone: this.data.zone_id,
      //         resId: this.resId,
      //       })
      //     },
      //     meta: (obj) => {
      //       const ret = {
      //         validate: false,
      //         tooltip: null,
      //       }
      //       if (isPrivate || isPublic) {
      //         ret.tooltip = '私有云、公有云不支持此操作'
      //         return ret
      //       }
      //       ret.validate = true
      //       return ret
      //     },
      //   },
      // ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>

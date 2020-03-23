<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="vpcs"
    statusModule="vpc" />
</template>

<script>
import {
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'VPCDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getBrandTableColumn(),
        {
          field: 'cidr_block',
          title: '目标网段',
        },
        {
          field: 'wire_count',
          title: '二层网络数量',
        },
        {
          field: 'routetable_count',
          title: '路由表数量',
        },
        {
          field: 'network_count',
          title: 'IP子网数量',
          slots: {
            default: ({ row }) => {
              if (!row.network_count) return '-'
              return [<a onClick={ () => this.$emit('tab-change', 'network-list') }>{row.network_count}</a>]
            },
          },
        },
        {
          field: 'natgateway_count',
          title: 'nat网关数量',
        },
      ],
      extraInfo: [],
    }
  },
}
</script>

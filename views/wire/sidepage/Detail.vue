<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="wires" />
</template>

<script>
import { getBandwidthTableColumn } from '../utils/columns'
import { getBrandTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'WireDetail',
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
        getBandwidthTableColumn(),
        {
          field: 'vpc',
          title: 'VPC',
        },
        {
          field: 'networks',
          title: '网络数量',
          slots: {
            default: ({ row }, h) => {
              return [
                <p>{ row.networks }<span style={{ color: '#aaa' }}>（IP子网数量）</span></p>,
              ]
            },
          },
        },
        {
          field: 'region',
          title: '区域',
        },
      ],
      extraInfo: [],
    }
  },
}
</script>

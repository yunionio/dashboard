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
          title: '专有网络',
        },
        {
          field: 'networks',
          title: '网络数量（IP子网数量）',
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

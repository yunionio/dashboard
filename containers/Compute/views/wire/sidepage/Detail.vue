<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import { getBrandTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'WireDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'bandwidth',
          title: '带宽',
        },
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
        getBrandTableColumn(),
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [],
        },
      ],
    }
  },
}
</script>

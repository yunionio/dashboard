<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="sku" />
</template>

<script>
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'SkuDetail',
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
        getEnabledTableColumn(),
        {
          field: 'cpu_core_count',
          title: 'CPU核数',
        },
        {
          field: 'memory_size_mb',
          title: '内存容量',
        },
        {
          field: 'total_guest_count',
          title: '关联主机数量',
        },
        {
          field: 'brand',
          title: '平台',
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'last_sync',
              title: '同步时间',
              formatter: ({ row }) => {
                return this.$moment(row.last_sync).format()
              },
            },
          ],
        },
      ],
    }
  },
}
</script>

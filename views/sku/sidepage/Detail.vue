<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import { getEnabledTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'SkuDetail',
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
          field: 'name',
          title: '名称',
        },
        getEnabledTableColumn(),
        getStatusTableColumn({ statusModule: 'sku' }),
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

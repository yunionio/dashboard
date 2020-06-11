<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="sku"
    :nameProps="{
      edit: false,
    }" />
</template>

<script>
import { sizestr } from '@/utils/utils'
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
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024) + 'B'
          },
        },
        {
          field: 'total_guest_count',
          title: `关联${this.$t('dictionary.server')}数量`,
          slots: {
            default: ({ row }) => {
              if (row.total_guest_count <= 0) return row.total_guest_count
              return [<a onClick={ () => this.$emit('tab-change', 'vminstance-list') }>{ `${row.total_guest_count}` }</a>]
            },
          },
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

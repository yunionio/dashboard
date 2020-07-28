<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    status-module="instanceGroup" />
</template>

<script>
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'InstanceGroupDetail',
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getEnabledTableColumn(),
        {
          field: 'guest_count',
          title: '已关联虚拟机',
          slots: {
            default: ({ row }) => {
              if (row.guest_count > 0) {
                return [(
                  <a onClick={ () => this.$emit('tab-change', 'v-m-instance-list-for-instance-group') }>{ row.guest_count }</a>
                )]
              }
              return `${row.guest_count}`
            },
          },
        },
        {
          field: 'force_dispersion',
          title: '策略',
          formatter: ({ cellValue }) => {
            let ret = '非强制'
            if (cellValue) ret = '强制'
            return ret
          },
        },
        {
          field: 'granularity',
          title: '粒度',
        },
      ],
    }
  },
}
</script>

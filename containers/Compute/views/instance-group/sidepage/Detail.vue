<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { getEnabledTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'InstanceGroupDetail',
  props: {
    list: {
      type: Object,
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
        getStatusTableColumn({ statusModule: 'instanceGroup' }),
        {
          field: 'guest_count',
          title: '绑定主机数量',
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
      ],
    }
  },
}
</script>

<template>
  <detail
    :data="data"
    :on-manager="onManager"
    :base-info="baseInfo" />
</template>

<script>
import { STRATEGY_CN } from '@Cloudenv/constants/sched'
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'SchedpolicyDetail',
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
          field: 'resource_type',
          title: '资源类型',
        },
        {
          field: 'schedtag',
          title: '标签(调度标签)',
        },
        {
          field: 'strategy',
          title: '偏好',
          formatter: ({ row }) => STRATEGY_CN[row.strategy] || '无',
        },
        {
          field: 'condition',
          title: '条件',
        },
      ],
    }
  },
}
</script>

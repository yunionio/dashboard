<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'DynamicschedtagDetail',
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
          field: 'condition',
          title: '条件',
        },
      ],
    }
  },
}
</script>

<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    statusModule="ansiblePlaybook"
    status-module="disk" />
</template>

<script>
// import { sizestr } from '@/utils/utils'
import { getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'AnsiblePlaybookDetail',
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
        getTimeTableColumn({
          field: 'start_time',
          title: '开始时间',
        }),
        getTimeTableColumn({
          field: 'end_time',
          title: '结束时间',
        }),
      ],
    }
  },
}
</script>

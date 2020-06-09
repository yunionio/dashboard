<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    statusModule="scheduledtask" />
</template>

<script>
import {
  getOperationColumns,
  getResourceTypeColumns,
  getLabelTypeColumns,
  getTimerDescColumns,
} from '../utils/columns'

export default {
  name: 'ScheduledtaskDetail',
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
        getOperationColumns(),
        getResourceTypeColumns(),
        {
          field: 'labels',
          title: '资源数量',
          formatter: ({ row }) => {
            return <a onClick={ () => this.$emit('tab-change', 'related-resource') }>{row.labels.length}</a>
          },
        },
        getLabelTypeColumns(),
        getTimerDescColumns(),
      ],
    }
  },
}
</script>

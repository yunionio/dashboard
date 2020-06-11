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
  getResourceNumberColumns,
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
        getResourceNumberColumns(),
        getLabelTypeColumns(),
        getTimerDescColumns(),
      ],
    }
  },
}
</script>

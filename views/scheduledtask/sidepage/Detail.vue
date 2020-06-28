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
import {
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'

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
        getEnabledTableColumn(),
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

<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import {
  getDefaultStrategyTableColumn,
  getResourceTypeTableColumn,
  getResourceCountTableColumn,
  getDynamicSchedtagCountTableColumn,
  getSchedpolicyCountTableColumn,
} from '../utils/columns'

export default {
  name: 'SchedtagDetail',
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
        getDefaultStrategyTableColumn(),
        getResourceTypeTableColumn(),
        getResourceCountTableColumn(),
        getDynamicSchedtagCountTableColumn(),
        getSchedpolicyCountTableColumn(),
      ],
    }
  },
}
</script>

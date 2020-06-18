<template>
  <detail
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :on-manager="onManager"
    status-module="commonalert"
    :resource="resource" />
</template>

<script>
import { levelColumn, conditionColumn, strategyColumn } from '../utils'
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'CommonalertDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    resource: String,
  },
  data () {
    return {
      baseInfo: [
        getEnabledTableColumn(),
        strategyColumn,
        levelColumn,
        conditionColumn,
      ],
      extraInfo: [],
    }
  },
}
</script>

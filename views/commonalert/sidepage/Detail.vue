<template>
  <detail
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :on-manager="onManager"
    :hiddenKeys="hiddenKeys"
    status-module="commonalert"
    :resource="resource" />
</template>

<script>
import { levelColumn, conditionColumn, strategyColumn, projectTableColumn } from '../utils'
import { getEnabledTableColumn, getProjectTableColumn } from '@/utils/common/tableColumn'

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
        projectTableColumn,
        getEnabledTableColumn(),
        strategyColumn,
        levelColumn,
        conditionColumn,
        getProjectTableColumn(),
      ],
      extraInfo: [],
      hiddenKeys: ['project_domain', 'tenant'],
    }
  },
}
</script>

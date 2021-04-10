<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    statusModule="policydefinition" />
</template>

<script>
import {
  getCategoryTableColumn,
  getConditionTableColumn,
  getParameterTableColumn,
} from '../utils/columns'

export default {
  name: 'PolicydefinitionDetail',
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
        getCategoryTableColumn(),
        getConditionTableColumn(),
        getParameterTableColumn(),
      ],
    }
  },
}
</script>

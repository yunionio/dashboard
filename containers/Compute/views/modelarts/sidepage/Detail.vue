<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    status-module="modelarts"
    :hiddenKeys="['zone', 'region']"
    resource="modelarts_pools" />
</template>

<script>
import {
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  getTrainingJobTableColumn,
  getInferenceServiceTableColumn,
  getDevelopEnvTableColumn,
} from '../utils/columns'

export default {
  name: 'ModelArtsDetail',
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
        getTrainingJobTableColumn(),
        getInferenceServiceTableColumn(),
        getDevelopEnvTableColumn(),
        getBrandTableColumn(),
      ],
    }
  },
  methods: {
  },
}
</script>

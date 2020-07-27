<template>
  <detail
    :on-manager="onManager"
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
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getTimeTableColumn({
          field: 'start_time',
          title: this.$t('compute.text_230'),
        }),
        getTimeTableColumn({
          field: 'end_time',
          title: this.$t('compute.text_231'),
        }),
      ],
    }
  },
}
</script>

<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
// import { sizestr } from '@/utils/utils'
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'AnsibleTemplateDetail',
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
        {
          filed: 'interval',
          title: '时间间隔',
          slots: {
            default: ({ row }) => {
              return row.hour + '小时'
            },
          },
        },
      ],
    }
  },
}
</script>

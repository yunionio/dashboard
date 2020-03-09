<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="snapshotpolicy" />
</template>

<script>
import { weekOptions, timeOptions } from '../constants'
import { getBindingDiskCountColumn } from '../utils/columns'

export default {
  name: 'SnapshotPolicyDetail',
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
    const detailData = {
      baseInfo: [
        getBindingDiskCountColumn(),
        {
          field: 'time_points',
          title: '备份时间',
          formatter: ({ cellValue }) => {
            let text = ''
            if (cellValue && cellValue.length) {
              text += cellValue.map(item => timeOptions[item]).join('、')
            }
            return text || '-'
          },
        },
        {
          field: 'repeat_weekdays',
          title: '备份日期',
          formatter: ({ cellValue }) => {
            let text = ''
            if (cellValue && cellValue.length) {
              text += '每' + cellValue.map(item => weekOptions[item - 1]).join('、')
            }
            return text || '-'
          },
        },
        {
          field: 'retention_days',
          title: '保留时间',
          formatter: ({ cellValue }) => {
            if (cellValue !== -1) {
              return `${cellValue}天`
            }
            return '永久保留'
          },
        },
      ],
      extraInfo: [],
    }
    return detailData
  },
}
</script>

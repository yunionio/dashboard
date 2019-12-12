<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    status-module="snapshotpolicy" />
</template>

<script>
import { weekOptions, timeOptions } from '../constants'

export default {
  name: 'SnapshotPolicyDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
      required: true,
    },
  },
  data () {
    const detailData = {
      baseInfo: [
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
    }
    return detailData
  },
}
</script>

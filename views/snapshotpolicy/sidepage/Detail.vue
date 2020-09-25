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
        {
          filed: 'binding_disk_count',
          title: this.$t('table.title.bind_disk_count'),
          width: 120,
          slots: {
            default: ({ row }) => {
              if (row.binding_disk_count <= 0) return row.binding_disk_count
              return [<a onClick={ () => this.$emit('tab-change', 'snapshot-policy-disk') }>{row.binding_disk_count}</a>]
            },
          },
        },
        {
          field: 'time_points',
          title: this.$t('compute.text_432'),
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
          title: this.$t('compute.text_431'),
          formatter: ({ cellValue }) => {
            let text = ''
            if (cellValue && cellValue.length) {
              text += this.$t('compute.text_1098') + cellValue.map(item => weekOptions[item - 1]).join('、')
            }
            return text || '-'
          },
        },
        {
          field: 'retention_days',
          title: this.$t('compute.text_433'),
          formatter: ({ cellValue }) => {
            if (cellValue !== -1) {
              return this.$t('compute.text_438', [cellValue])
            }
            return this.$t('compute.text_1094')
          },
        },
      ],
      extraInfo: [],
    }
    return detailData
  },
}
</script>

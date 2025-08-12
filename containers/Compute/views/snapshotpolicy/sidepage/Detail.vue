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
          field: 'binding_disk_count',
          title: this.$t('compute.bind_resource_count'),
          minWidth: 120,
          slots: {
            default: ({ row }) => {
              if (row.binding_disk_count === undefined) return [<data-loading />]
              if (row.type === 'server') {
                if (row.binding_resource_count <= 0) return row.binding_resource_count
                return [
                  <side-page-trigger name='SnapshotPolicySidePage' id={row.id} tab='snapshot-policy-server' vm={this}>{row.binding_resource_count}</side-page-trigger>,
                ]
              }
              if (row.binding_disk_count <= 0) return row.binding_disk_count
              return [
                <side-page-trigger name='SnapshotPolicySidePage' id={row.id} tab='snapshot-policy-disk' vm={this}>{row.binding_disk_count}</side-page-trigger>,
              ]
            },
          },
        },
        {
          field: 'time_points_display',
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
          field: 'repeat_weekdays_display',
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
          formatter: ({ row }) => {
            if (row.retention_count) {
              return `${this.$t('compute.retention_count_prefix')} ${row.retention_count} ${this.$t('compute.retention_count_suffix')}`
            }
            if (row.retention_days !== -1) {
              return this.$t('compute.text_438', [row.retention_days])
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

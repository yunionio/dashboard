import { getNameDescriptionTableColumn, getTimeRangeColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        field: 'res_name',
        edit: false,
        onManager: this.onManager,
      }),
      {
        field: 'res_type',
        title: this.$t('monitor.text_97'),
        minWidth: 80,
        formatter: ({ row }) => {
          if (row.res_type && this.$te(`dictionary.${row.res_type}`)) {
            return this.$t(`dictionary.${row.res_type}`)
          }
          return '-'
        },
      },
      {
        field: 'alert_name',
        title: this.$t('monitor.text_2'),
        minWidth: 80,
      },
      getTimeRangeColumn({ title: this.$t('monitor.alerts.shield.timerange') }),
      {
        field: 'description',
        title: this.$t('monitor.alerts.shield.reason'),
        minWidth: 80,
        formatter: ({ row }) => {
          return row.description || '-'
        },
      },
    ]
  },
}

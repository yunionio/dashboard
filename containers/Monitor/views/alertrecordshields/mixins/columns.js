import { getNameDescriptionTableColumn, getTimeRangeColumn, getStatusTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      {
        field: 'alert_name',
        title: this.$t('monitor.text_99'),
        minWidth: 80,
      },
      getStatusTableColumn({ field: 'expired', statusModule: 'expired', minWidth: 50 }),
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
      getNameDescriptionTableColumn({
        field: 'res_name',
        title: this.$t('common_151'),
        edit: false,
        onManager: this.onManager,
      }),
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

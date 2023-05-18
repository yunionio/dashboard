import {
  // getAccountTableColumn,
  getTimeTableColumn,
  getStatusTableColumn,
  getTimeDurationColumn,
  // getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      // getNameDescriptionTableColumn({
      //   onManager: this.onManager,
      //   hideField: true,
      //   title: this.$t('cloudenv.task_type'),
      //   edit: false,
      //   showDesc: false,
      //   slotCallback: row => {
      //     const name = this.$te(`bill.task_type.${row.task_type}`) ? this.$t(`bill.task_type.${row.task_type}`) : row.task_type || '-'
      //     return (
      //       <side-page-trigger onTrigger={() => this.handleOpenSidepage({ name, ...row })}>{name}</side-page-trigger>
      //     )
      //   },
      // }),
      {
        title: this.$t('cloudenv.task_id'),
        field: 'id',
        minWidth: 80,
        showOverflow: 'ellipsis',
      },
      {
        field: 'task_type',
        title: this.$t('cloudenv.task_type'),
        slots: {
          default: ({ row }) => {
            const name = this.$te(`cloudenv.task_type.${row.task_type}`) ? this.$t(`cloudenv.task_type.${row.task_type}`) : row.task_type || '-'
            return [
              <side-page-trigger onTrigger={() => this.handleOpenSidepage({ name, ...row })}>{name}</side-page-trigger>,
            ]
          },
        },
        formatter: ({ row }) => {
          const name = this.$te(`cloudenv.task_type.${row.task_type}`) ? this.$t(`cloudenv.task_type.${row.task_type}`) : row.task_type || '-'
          return name
        },
      },
      getStatusTableColumn({ statusModule: 'billtasks' }),
      // getAccountTableColumn(),
      {
        field: 'mode',
        title: this.$t('cloudenv.bill_task.task_mode'),
        formatter: ({ row }) => {
          return this.$te(`cloudenv.bill_task.task_mode.${row.mode}`) ? this.$t(`cloudenv.bill_task.task_mode.${row.mode}`) : '-'
        },
      },
      {
        field: 'month',
        title: this.$t('cloudenv.month'),
        formatter: ({ row }) => {
          if (!row.month) return '-'
          return this.$moment(row.month + '').format('YYYY-MM')
        },
      },
      getTimeTableColumn({ field: 'started_at', title: this.$t('cloudenv.text_461') }),
      getTimeTableColumn({ field: 'ended_at', title: this.$t('cloudenv.text_462') }),
      getTimeDurationColumn({
        field: 'time_duration',
        title: this.$t('cloudenv.time_duration'),
        start_field: 'started_at',
        end_field: 'ended_at',
      }),
    ]
  },
}

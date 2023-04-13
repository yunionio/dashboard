import {
  // getAccountTableColumn,
  getTimeTableColumn,
  getStatusTableColumn,
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
        field: 'task_type',
        title: this.$t('cloudenv.task_type'),
        slots: {
          default: ({ row }) => {
            const name = this.$te(`bill.task_type.${row.task_type}`) ? this.$t(`bill.task_type.${row.task_type}`) : row.task_type || '-'
            return [
              <side-page-trigger onTrigger={() => this.handleOpenSidepage({ name, ...row })}>{name}</side-page-trigger>,
            ]
          },
        },
        formatter: ({ row }) => {
          const name = this.$te(`bill.task_type.${row.task_type}`) ? this.$t(`bill.task_type.${row.task_type}`) : row.task_type || '-'
          return name
        },
      },
      getStatusTableColumn({ statusModule: 'billtasks' }),
      // getAccountTableColumn(),
      {
        field: 'mode',
        title: this.$t('cloudenv.bill_task.task_mode'),
        formatter: ({ row }) => {
          return this.$te(`bill.bill_task.task_mode.${row.mode}`) ? this.$t(`bill.bill_task.task_mode.${row.mode}`) : '-'
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
    ]
  },
}

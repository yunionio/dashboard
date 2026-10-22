import {
  getTimeTableColumn,
  getStatusTableColumn,
  getTimeDurationColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      {
        title: this.$t('cloudenv.task_id'),
        field: 'id',
        minWidth: 100,
        showOverflow: 'ellipsis',
      },
      {
        field: 'name',
        title: this.$t('table.title.name'),
        minWidth: 160,
        slots: {
          default: ({ row }) => {
            return [
              <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name || '-'}</side-page-trigger>,
            ]
          },
        },
      },
      {
        field: 'level',
        title: this.$t('cloudenv.sync_task.level'),
        formatter: ({ row }) => {
          return this.$te(`cloudenv.sync_task.level.${row.level}`) ? this.$t(`cloudenv.sync_task.level.${row.level}`) : (row.level || '-')
        },
      },
      getStatusTableColumn({ statusModule: 'cloudaccountSyncTasks' }),
      {
        field: 'mode',
        title: this.$t('cloudenv.bill_task.task_mode'),
        formatter: ({ row }) => {
          return this.$te(`cloudenv.bill_task.task_mode.${row.mode}`) ? this.$t(`cloudenv.bill_task.task_mode.${row.mode}`) : '-'
        },
      },
      {
        field: 'progress',
        title: this.$t('cloudenv.sync_task.progress'),
        minWidth: 120,
        formatter: ({ row }) => {
          if (!row.child_total) return '-'
          const done = (row.child_done || 0) + (row.child_fail || 0) + (row.child_cancel || 0)
          return `${done}/${row.child_total}`
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

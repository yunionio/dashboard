<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :hiddenKeys="[]"
    statusModule="cloudaccountSyncTasks" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getTimeTableColumn,
  getTimeDurationColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'CloudaccountSyncTaskDetail',
  mixins: [WindowsMixin],
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
  computed: {
    baseInfo () {
      const infos = [
        {
          field: 'level',
          title: this.$t('cloudenv.sync_task.level'),
          formatter: ({ row }) => {
            return this.$te(`cloudenv.sync_task.level.${row.level}`) ? this.$t(`cloudenv.sync_task.level.${row.level}`) : (row.level || '-')
          },
        },
        {
          field: 'mode',
          title: this.$t('cloudenv.bill_task.task_mode'),
          formatter: ({ row }) => {
            return this.$te(`cloudenv.bill_task.task_mode.${row.mode}`) ? this.$t(`cloudenv.bill_task.task_mode.${row.mode}`) : '-'
          },
        },
        {
          field: 'cloudaccount',
          title: this.$t('dictionary.cloudaccount'),
        },
        {
          field: 'cloudprovider',
          title: this.$t('dictionary.cloudprovider'),
        },
        {
          field: 'cloudregion',
          title: this.$t('dictionary.cloudregion'),
        },
      ]
      // L3 region is leaf, no child progress
      if (this.data.level !== 'region') {
        infos.push({
          field: 'progress',
          title: this.$t('cloudenv.sync_task.progress'),
          formatter: ({ row }) => {
            if (!row.child_total) return '-'
            const done = (row.child_done || 0) + (row.child_fail || 0) + (row.child_cancel || 0)
            return `${done}/${row.child_total}`
          },
        })
      }
      infos.push(
        getTimeTableColumn({ field: 'queued_at', title: this.$t('cloudenv.sync_task.queued_at') }),
        getTimeTableColumn({ field: 'started_at', title: this.$t('cloudenv.text_461') }),
        getTimeTableColumn({ field: 'ended_at', title: this.$t('cloudenv.text_462') }),
        getTimeDurationColumn({
          field: 'time_duration',
          title: this.$t('cloudenv.time_duration'),
          start_field: 'started_at',
          end_field: 'ended_at',
        }),
      )
      return infos
    },
  },
}
</script>

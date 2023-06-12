<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :hiddenKeys="['name']"
    statusModule="billtasks" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getAccountTableColumn,
  getTimeTableColumn,
  getTimeDurationColumn,
  // getStatusTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'BilltaskDetail',
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
  data () {
    return {
      baseInfo: [
        {
          title: this.$t('cloudenv.task_type'),
          field: 'task_type',
          formatter: ({ row }) => {
            return this.$te(`cloudenv.task_type.${row.task_type}`) ? this.$t(`cloudenv.task_type.${row.task_type}`) : row.task_type || '-'
          },
        },
        {
          field: 'mode',
          title: this.$t('cloudenv.bill_task.task_mode'),
          formatter: ({ row }) => {
            return this.$te(`cloudenv.bill_task.task_mode.${row.mode}`) ? this.$t(`cloudenv.bill_task.task_mode.${row.mode}`) : '-'
          },
        },
        // getStatusTableColumn({ statusModule: 'billtasks' }),
        getAccountTableColumn(),
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
      ],
    }
  },
  methods: {
  },
}
</script>

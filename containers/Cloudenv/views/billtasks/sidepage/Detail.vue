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
            return this.$te(`bill.task_type.${row.task_type}`) ? this.$t(`bill.task_type.${row.task_type}`) : row.task_type || '-'
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
        getTimeTableColumn({ field: 'started_at', title: this.$t('cloudenv.text_40') }),
        getTimeTableColumn({ field: 'ended_at', title: this.$t('cloudenv.text_41') }),
      ],
    }
  },
  methods: {
  },
}
</script>

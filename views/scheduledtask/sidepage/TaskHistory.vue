<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import {
  getStatusTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'TaskHistoryForScheduledtaskSidePage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'scheduledtaskactivities',
        getParams: { details: true, scheduled_task: this.resId },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        {
          field: 'id',
          title: 'ID',
          minWidth: '200',
        },
        getStatusTableColumn({ statusModule: 'scheduledtaskactivity' }),
        getTimeTableColumn({ title: '开始时间' }),
        getTimeTableColumn({ field: 'end_time', title: '结束时间' }),
      ],
      singleActions: [
        {
          label: '查看',
          action: (row) => {
            this.createDialog('EventLogDialog', {
              data: row.reason,
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>

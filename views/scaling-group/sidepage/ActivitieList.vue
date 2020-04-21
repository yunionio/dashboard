<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox" />
</template>

<script>
import { getStatusTableColumn, getTimeTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { getStatusFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'

export default {
  name: 'ScalingGroupActivitieListSidePage',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'scalingactivities',
        apiVersion: 'v1',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.scalingactivitie).flat(),
        filterOptions: {
          status: getStatusFilter('scalingactivitie'),
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'id',
          title: 'ID',
        }),
        getStatusTableColumn({ statusModule: 'scalingactivitie', minWidth: 100 }),
        {
          field: 'trigger_desc',
          title: '起因描述',
          minWidth: 200,
        },
        {
          field: 'action_desc',
          title: '行为描述',
          minWidth: 200,
        },
        getTimeTableColumn({
          field: 'start_time',
          title: '开始时间',
          sortable: true,
        }),
        getTimeTableColumn({
          field: 'end_time',
          title: '结束时间',
          sortable: true,
        }),
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

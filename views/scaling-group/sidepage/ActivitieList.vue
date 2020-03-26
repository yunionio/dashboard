<template>
  <page-list
    :list="list"
    :columns="columns"
    :showSearchbox="showSearchbox" />
</template>

<script>
import { getStatusTableColumn, getTimeTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { getStatusFilter } from '@/utils/common/tableFilter'
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
        filterOptions: {
          status: getStatusFilter('host'),
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'id',
          title: 'ID',
        }),
        getStatusTableColumn({ statusModule: 'scalingactivitie', minWidth: 150 }),
        {
          field: 'trigger_desc',
          title: '起因描述',
          minWidth: 150,
        },
        {
          field: 'action_desc',
          title: '行为描述',
          minWidth: 150,
        },
        getTimeTableColumn({
          field: 'start_time',
          title: '开始时间',
        }),
        getTimeTableColumn({
          field: 'end_time',
          title: '结束时间',
        }),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>

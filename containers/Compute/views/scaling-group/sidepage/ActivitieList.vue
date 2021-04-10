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
        id: 'ActivitieListForScalingGroupSidePage',
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
          title: this.$t('compute.text_956'),
          minWidth: 200,
        },
        {
          field: 'action_desc',
          title: this.$t('compute.text_957'),
          minWidth: 200,
        },
        getTimeTableColumn({
          field: 'start_time',
          title: this.$t('compute.text_230'),
          sortable: true,
        }),
        getTimeTableColumn({
          field: 'end_time',
          title: this.$t('compute.text_231'),
          sortable: true,
        }),
      ],
      singleActions: [
        {
          label: this.$t('compute.text_958'),
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

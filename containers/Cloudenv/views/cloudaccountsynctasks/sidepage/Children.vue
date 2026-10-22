<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :show-searchbox="false"
    :show-group-actions="false" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'CloudaccountSyncTaskChildren',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: `CloudaccountSyncTaskChildren-${this.data.id}`,
        apiVersion: 'v2',
        resource: 'cloudaccountsynctasks',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.cloudaccountSyncTasks).flat(),
      }),
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        details: true,
        parent_id: this.data.id,
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CloudaccountSyncTaskSidePage', {
        id: row.id,
        resource: 'cloudaccountsynctasks',
        apiVersion: 'v2',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

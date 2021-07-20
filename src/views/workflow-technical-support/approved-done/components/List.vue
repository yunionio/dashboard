<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { PRIORITY_OPTS } from '@/constants/workflow'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { statusSearchMap } from '../../constants'

export default {
  name: 'ApprovedDoneList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    listId: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'historic-task-instances',
        apiVersion: 'v1',
        getParams: this.getParam,
        sortKeys: ['create_time'],
        filterOptions: {
          process_instance_id: {
            label: this.$t('common_350'),
          },
          status: {
            label: this.$t('common.status'),
            dropdown: true,
            items: Object.keys(statusSearchMap).map((v) => {
              return {
                label: statusSearchMap[v]?.text || v,
                key: v,
              }
            }),
          },
          priority: {
            label: this.$t('common.workflow_priority'),
            dropdown: true,
            items: PRIORITY_OPTS.map(v => {
              return {
                label: v.value,
                key: v.key,
              }
            }),
          },
        },
      }),
      groupActions: [],
    }
  },
  created () {
    this.initSidePageTab('approval-done-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
        user_id: this.userInfo.id,
        delete_reason: 'completed',
        process_definition_key: 'customer-service',
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ApprovedDoneSidePage', {
        id: row.id,
        resource: 'historic-task-instances',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

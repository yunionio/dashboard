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
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'MePartakeList',
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
          resource_name: {
            label: this.$t('common_151'),
          },
          resource_project: {
            label: this.$t('common_310'),
          },
        },
      }),
      groupActions: [],
    }
  },
  created () {
    this.initSidePageTab('me-partake-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
        user_id: this.userInfo.id,
        delete_reason: 'deleted',
        process_definition_key_exclude: 'customer-service',
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'MePartakeSidePage', {
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

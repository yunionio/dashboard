<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AllProcessList',
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
        resource: 'historic-process-instances',
        apiVersion: 'v1',
        getParams: this.getParam,
        sortKeys: ['create_time'],
        filterOptions: {
          id: {
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
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.initSidePageTab('all-process-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AllProcessSidePage', {
        id: row.id,
        resource: 'historic-process-instances',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

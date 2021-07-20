<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'ThirdProcessList',
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
        resource: 'extra-process-instances',
        apiVersion: 'v1',
        getParams: this.getParam,
        sortKeys: ['create_time'],
        filterOptions: {
          id: {
            label: this.$t('common_350'),
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
    this.initSidePageTab('third-process-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
        user_id: this.userInfo.id,
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ThirdProcessSidePage', {
        id: row.id,
        resource: 'extra-process-instances',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

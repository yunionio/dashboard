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
import { PRIORITY_OPTS } from '@/constants/workflow'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { statusSearchMap } from '../../constants'

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
  computed: {
    ...mapGetters(['userInfo', 'isDomainMode']),
  },
  created () {
    this.initSidePageTab('all-process-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const domainParams = {
        user_id: this.userInfo.id,
        role_name: 'domainadmin',
      }
      let params = {
        ...this.getParams,
        process_definition_key: 'customer-service',
      }
      if (this.isDomainMode) {
        params = { ...domainParams, ...params }
      }
      return params
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

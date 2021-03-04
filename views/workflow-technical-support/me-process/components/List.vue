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
import { statusMap } from '../../constants'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { PRIORITY_OPTS } from '@/constants/workflow'

export default {
  name: 'WorkflowSupportMeProcessList',
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
            items: Object.keys(statusMap).map((v) => {
              return {
                label: statusMap[v]?.text || v,
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
      groupActions: [
        {
          label: this.$t('navbar.button.work_order_support'),
          action: () => {
            this.createDialog('CustomeServiceDialog', {})
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.initSidePageTab('me-process-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
        user_id: this.userInfo.id,
        process_definition_key: 'customer-service',
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'MeProcessSidePage', {
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

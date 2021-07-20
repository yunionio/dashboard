<template>
  <div>
    <page-list
      :list="list"
      :columns="columns"
      :single-actions="singleActions"
      :group-actions="groupActions"
      :showCheckbox="false" />
  </div>
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
      groupActions: [
        {
          label: this.$t('navbar.button.work_order_support'),
          action: () => {
            this.createDialog('CustomeServiceDialog', {
              callback: () => {
                this.fetchData()
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
          hidden: () => {
            return this.isAdminMode === true
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdminMode']),
  },
  created () {
    this.initSidePageTab('me-process-detail')
    this.fetchData()
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
        user_id: this.userInfo.id,
        process_definition_key: 'customer-service',
      }
    },
    fetchData () {
      this.list.fetchData()
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

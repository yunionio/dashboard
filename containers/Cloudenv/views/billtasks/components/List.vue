<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getStatusFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'ProjectSharingList',
  components: {
  },
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    accountData: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        apiVersion: 'v1',
        resource: 'billtasks',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.billtasks).flat(),
        filterOptions: {
          // account: getAccountFilter({ distinctType: 'field' }),
          task_type: {
            label: this.$t('cloudenv.task_type'),
            dropdown: true,
            items: [
              { key: 'pull_bill', label: this.$t('cloudenv.task_type.pull_bill') },
              { key: 'prepaid_amortizing', label: this.$t('cloudenv.task_type.prepaid_amortizing') },
              { key: 'project_sharing', label: this.$t('cloudenv.task_type.project_sharing') },
              { key: 'recalculate', label: this.$t('cloudenv.task_type.recalculate') },
              { key: 'delete_bill', label: this.$t('cloudenv.task_type.delete_bill') },
            ],
          },
          status: getStatusFilter({ statusModule: 'billtasks' }),
        },
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'billtasks_create',
          action: () => {
            this.createDialog('BilltasksCreateDialog', {
              onManager: this.onManager,
              type: 'create_billtask',
              data: [this.accountData],
              account_id: this.accountData.id,
              success: () => {
                this.list.refresh()
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('dialog.cancel'),
          permission: 'billtasks_perform_cancel',
          action: (obj) => {
            this.createDialog('BilltasksCancelDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = { validate: true }
            if (!this.list.selectedItems.length) {
              ret.validate = false
              return ret
            }
            const canCancel = this.list.selectedItems.every(item => item.status === 'running' || item.status === 'queued')
            if (!canCancel) {
              ret.validate = false
              ret.tooltip = this.$t('cloudenv.billtask_cannot_cancel')
            }
            return ret
          },
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      const items = this.columns.map(item => {
        return {
          key: item.field,
          label: item.title,
          formatter: item.formatter,
        }
      })
      return {
        title: this.$t('cloudenv.bill_tasks'),
        downloadType: 'local',
        items,
      }
    },
  },
  created () {
    this.fetchData()
    this.$bus.$on('refreshBillTaskList', () => {
      this.list.refresh()
    })
  },
  methods: {
    fetchData () {
      this.list.fetchData()
    },
    getParam () {
      const getParams = (R.is(Function, this.getParams) ? this.getParams() : this.getParams)
      const ret = {
        details: false,
        ...getParams,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'BilltaskSidePage', {
        id: row.id,
        resource: 'billtasks',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab: 'event-drawer',
      })
    },
  },
}
</script>

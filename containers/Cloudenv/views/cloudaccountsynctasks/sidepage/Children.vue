<template>
  <page-list
    :list="list"
    :columns="listColumns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :show-searchbox="true"
    :show-sync="true"
    :show-group-actions="true" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'
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
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter({ statusModule: 'cloudaccountSyncTasks' }),
          mode: {
            label: this.$t('cloudenv.bill_task.task_mode'),
            dropdown: true,
            multiple: true,
            items: [
              { key: 'auto', label: this.$t('cloudenv.bill_task.task_mode.auto') },
              { key: 'manual', label: this.$t('cloudenv.bill_task.task_mode.manual') },
            ],
            filter: true,
            formatter: val => {
              return `mode.in(${val.map(item => `'${item}'`).join(',')})`
            },
          },
        },
      }),
      groupActions: [
        {
          label: this.$t('dialog.cancel'),
          permission: 'cloudaccountsynctasks_perform_cancel',
          action: () => {
            this.createDialog('CloudaccountsynctasksCancelDialog', {
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
            const canCancel = this.list.selectedItems.every(item => ['queued', 'running'].includes(item.status))
            if (!canCancel) {
              ret.validate = false
              ret.tooltip = this.$t('cloudenv.sync_task_cannot_cancel')
            }
            return ret
          },
        },
      ],
    }
  },
  computed: {
    // parent is L2 provider -> children are L3 region, hide progress column
    listColumns () {
      if (this.data.level === 'provider') {
        return this.columns.filter(col => col.field !== 'progress')
      }
      return this.columns
    },
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
      // L1/L2 打开子任务列表；L3 无子任务，进详情
      const tab = row.level !== 'region'
        ? 'cloudaccount-sync-task-children'
        : 'cloudaccount-sync-task-detail'
      this.sidePageTriggerHandle(this, 'CloudaccountSyncTaskSidePage', {
        id: row.id,
        resource: 'cloudaccountsynctasks',
        apiVersion: 'v2',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
      this.initSidePageTab(tab)
    },
  },
}
</script>

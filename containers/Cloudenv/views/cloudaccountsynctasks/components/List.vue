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
  name: 'CloudaccountSyncTasksList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    accountData: Object,
    showSearchbox: {
      type: Boolean,
      default: true,
    },
    showGroupActions: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        apiVersion: 'v2',
        resource: 'cloudaccountsynctasks',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.cloudaccountSyncTasks).flat(),
        filterOptions: {
          status: getStatusFilter({ statusModule: 'cloudaccountSyncTasks' }),
          level: {
            label: this.$t('cloudenv.sync_task.level'),
            dropdown: true,
            items: [
              { key: 'account', label: this.$t('cloudenv.sync_task.level.account') },
              { key: 'provider', label: this.$t('cloudenv.sync_task.level.provider') },
              { key: 'region', label: this.$t('cloudenv.sync_task.level.region') },
            ],
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
    exportDataOptions () {
      const items = this.columns.map(item => {
        return {
          key: item.field,
          label: item.title,
          formatter: item.formatter,
        }
      })
      return {
        title: this.$t('cloudenv.account_sync_tasks'),
        downloadType: 'local',
        items,
      }
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.list.fetchData()
    },
    getParam () {
      const getParams = (R.is(Function, this.getParams) ? this.getParams() : this.getParams)
      return {
        details: true,
        ...getParams,
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

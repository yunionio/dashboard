<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getStatusFilter,
  getDomainFilter,
  getTenantFilter,
} from '@/utils/common/tableFilter'
import {
  getSetPublicAction,
} from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'BackupStorageList',
  mixins: [WindowsMixin, ListMixin, SingleActionsMixin, ColumnsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
  },
  data () {
    return {
      deleteResProps: {
        force_delete: false,
      },
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'backupstorages',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.backupStorage).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          status: getStatusFilter('backupStorage'),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.name'), key: 'name' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.perform_sync_status'),
          permission: 'backupstorages_perform_syncstatus',
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['running', 'ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => ({
            validate: this.list.selected.length,
          }),
        },
        {
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              getSetPublicAction(this, {
                name: this.$t('dictionary.backup_storage'),
                scope: 'domain',
                resource: 'backupstorages',
              }, {
                permission: 'backupstorages_perform_public',
                meta: () => ({
                  validate: this.list.selected.length,
                }),
              }),
              {
                label: this.$t('table.action.set_tag'),
                permission: 'backupstorages_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'diskbackups',
                    },
                    tipName: this.$t('compute.text_462'),
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.selected.length,
                    tooltip: null,
                  }
                },
              },
              {
                label: this.$t('compute.perform_delete'),
                permission: 'backupstorages_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    title: this.$t('compute.perform_delete'),
                    name: this.$t('compute.backup_storage'),
                  })
                },
                meta: () => {
                  const ret = {
                    validate: this.list.selected.length,
                    tooltip: null,
                  }
                  if (this.list.selectedItems.some(item => !item.can_delete)) {
                    ret.validate = false
                    return ret
                  }
                  return ret
                },
              },
            ]
          },
        },
      ],
    }
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('backup-storage-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'BackupStorageSidePage', {
        id: row.id,
        resource: 'backupstorages',
        getParams: this.getParam,
        steadyStatus: this.list.steadyStatus,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

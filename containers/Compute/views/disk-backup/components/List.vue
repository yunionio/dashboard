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
    :showGroupActions="showGroupActions"
    :tableOverviewIndexs="tableOverviewIndexs" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getStatusFilter,
  getInBrandFilter,
  getDomainFilter,
  getTenantFilter,
} from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'DiskBackupList',
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
        force: false,
      },
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'diskbackups',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.diskBackup).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          status: getStatusFilter('diskBackup'),
          brand: getInBrandFilter('brands', ['OneCloud']),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      groupActions: [
        {
          label: this.$t('compute.perform_sync_status'),
          permission: 'diskbackups_perform_syncstatus',
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
          label: this.$t('table.action.set_tag'),
          permission: 'diskbackups_perform_set_user_metadata',
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
          permission: 'diskbackups_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              title: this.$t('compute.perform_delete'),
              name: this.$t('compute.text_462'),
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
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        title: this.$t('compute.disk_backup'),
        downloadType: 'local',
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        fixedItems: [
          { key: 'disk_size_mb', label: this.$t('compute.disk_size') + '(M)' },
          { key: 'size_mb', label: this.$t('compute.backup_size') + '(M)' },
        ],
      }
    },
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('disk-backup-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        is_instance_backup: false,
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'DiskBackupSidePage', {
        id: row.id,
        resource: 'diskbackups',
        getParams: this.getParam,
        steadyStatus: this.list.steadyStatus,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>

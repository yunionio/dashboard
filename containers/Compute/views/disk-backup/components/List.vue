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
          status: getStatusFilter('snapshot'),
          brand: getInBrandFilter('brands', ['OneCloud']),
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
          { label: this.$t('common.status'), key: 'status' },
          { label: this.$t('table.title.user_tag'), key: 'user_tags' },
          { label: this.$t('compute.disk_size'), key: 'size_mb' },
          { label: this.$t('table.title.disk_type'), key: 'disk_type' },
          { label: this.$t('res.disk'), key: 'disk_name' },
          { label: this.$t('res.project'), key: 'tenant' },
          { label: this.$t('table.title.create_time'), key: 'created_at' },
          { label: this.$t('compute.backup_storage'), key: 'backup_storage_name' },
          { label: this.$t('table.title.brand'), key: 'provider' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.perform_sync_status'),
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
          label: this.$t('compute.perform_delete'),
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
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DiskBackupSidePage', {
        id: row.id,
        resource: 'diskbackups',
        getParams: this.getParam,
        steadyStatus: this.list.steadyStatus,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

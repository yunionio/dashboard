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
  name: 'InstanceBackupList',
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
        resource: 'instancebackups',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.instanceBackup).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          status: getStatusFilter('instanceBackup'),
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
          { label: this.$t('table.title.create_time'), key: 'created_at' },
          { label: this.$t('compute.backup_storage'), key: 'backup_storage_name' },
          { label: this.$t('compute.backup_size'), key: 'size_mb' },
          { label: this.$t('compute.text_91'), key: 'guest' },
          { label: this.$t('table.title.os_arch'), key: 'os_arch' },
          { label: this.$t('table.title.os'), key: 'os_type' },
          { label: this.$t('table.title.brand'), key: 'provider' },
          { label: this.$t('res.project'), key: 'tenant' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.perform_sync_status'),
          permission: 'instancebackups_perform_syncstatus',
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
          permission: 'instancebackups_perform_set_user_metadata',
          action: () => {
            this.createDialog('SetTagDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              mode: 'add',
              params: {
                resources: 'instancebackups',
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
          permission: 'instancebackups_delete',
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
    this.initSidePageTab('instance-backup-detail')
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
      this.sidePageTriggerHandle(this, 'InstanceBackupSidePage', {
        id: row.id,
        resource: 'instancebackups',
        getParams: this.getParam,
        steadyStatus: this.list.steadyStatus,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

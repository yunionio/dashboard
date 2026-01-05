<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showSingleActions="isTemplate ? false : showActions"
    :showGroupActions="showActions && showGroupActions"
    :show-page="!isTemplate" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import {
  getNameFilter,
  getTenantFilter,
  getStatusFilter,
  getBrandFilter,
  getDomainFilter,
  getAccountFilter,
  getOsArchFilter,
  getRegionFilter,
  getDescriptionFilter,
  getDistinctFieldsFilter,
} from '@/utils/common/tableFilter'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { steadyStatus } from '../constants'

export default {
  name: 'SnapshotList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
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
        ctx: this,
        id: this.id,
        resource: 'snapshots',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus,
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          status: getStatusFilter('snapshot'),
          server_id: {
            label: this.$t('res.server'),
            hiddenField: 'guest',
          },
          brand: getBrandFilter(),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          account: getAccountFilter(),
          disk_name: {
            label: this.$t('res.disk'),
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `disks.id(disk_id).name.in(${val})`
            },
          },
          disk_type: {
            label: this.$t('table.title.disk_type'),
            dropdown: true,
            multiple: true,
            items: [
              { label: this.$t('compute.text_50'), key: 'data' },
              { label: this.$t('compute.text_49'), key: 'sys' },
            ],
          },
          region: getRegionFilter(),
          os_arch: getOsArchFilter(),
          storage: getDistinctFieldsFilter({
            label: this.$t('compute.text_99'),
            filter: true,
            multiple: false,
            type: 'extra_field',
            field: ['id', 'name'],
            mapper: (list, data) => {
              const { extra_fields = [] } = data
              const ret = extra_fields.map(item => ({ label: item.name, key: item.id })).filter(item => item.label && item.key)
              return ret
            },
            formatter: (val) => {
              const realVal = val.map(item => `'${item}'`)
              return `storage_id.in(${realVal})`
            },
            getParams: { extra_resource: 'storage', module: 'snapshots' },
          }),
        },
        responseData: this.responseData,
        hiddenColumns: ['storage_type', 'created_at', 'os_arch'],
        autoHiddenFilterKey: 'snapshot_hidden_columns',
      }),
      groupActions: [
        {
          label: this.$t('compute.perform_sync_status'),
          permission: 'snapshots_perform_syncstatus',
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
          permission: 'snapshots_perform_set_user_metadata',
          action: () => {
            this.createDialog('SetTagDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              mode: 'add',
              params: {
                resources: 'snapshot',
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
          permission: 'snapshots_delete',
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
            if (this.list.selectedItems.some(item => item.is_sub_snapshot)) {
              ret.validate = false
              ret.tooltip = this.$t('compute.text_1062')
              return ret
            }
            return ret
          },
        },
      ],
    }
  },
  computed: {
    showActions () {
      return !this.$isScopedPolicyMenuHidden('snapshot_hidden_columns.perform_action')
    },
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('compute.text_101'),
        items: [
          { field: 'id', title: 'ID' },
          { field: 'external_id', title: this.$t('table.title.external_id') },
          ...this.columns,
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
    this.initSidePageTab('snapshot-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        with_meta: true,
        is_instance_snapshot: false,
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'SnapshotSidePage', {
        id: row.id,
        resource: 'snapshots',
        getParams: this.getParam,
        steadyStatus: this.list.steadyStatus,
      }, {
        list: this.list,
        type: 'disk',
        tab,
      })
    },
  },
}
</script>

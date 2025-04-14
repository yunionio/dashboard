<template>
  <page-list
    show-tag-config
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions"
    :showSingleActions="showActions"
    :showGroupActions="showActions && showGroupActions"
    :export-data-options="exportDataOptions"
    :show-tag-columns="true"
    :show-tag-columns2="true"
    :show-tag-filter="true"
    :tag-config-params="tagConfigParams" />
</template>

<script>
import * as R from 'ramda'
import ListMixin from '@/mixins/list'
import { getNameFilter, getStatusFilter, getTenantFilter, getBrandFilter, getCloudProviderFilter, getAccountFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ResStatusFilterMixin from '@/mixins/resStatusFilterMixin'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'MongoDBList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin, ResStatusFilterMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'mongodbs',
        apiVersion: 'v1',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.mongodb).flat(),
        filterOptions: {
          name: getNameFilter(),
          description: getDescriptionFilter(),
          status: getStatusFilter('mongodb'),
          ip_addr: {
            field: 'ip_addr',
            label: this.$t('db.text_152'),
            filter: true,
            formatter: val => {
              return `ip_addr.contains(${val})`
            },
          },
          brand: getBrandFilter('mongodb_engine_brands'),
          account: getAccountFilter(),
          manager: getCloudProviderFilter(),
          region: {
            label: this.$t('db.text_40'),
          },
          projects: getTenantFilter(),
        },
        responseData: this.responseData,
        autoHiddenFilterKey: 'mongodb_hidden_columns',
        fetchDataCb: (res) => {
          const { totals = {} } = res.data
          this.$emit('resStatisticsChange', totals)
        },
      }),
      groupActions: [
        {
          label: this.$t('db.text_69'),
          permission: 'mongodbs_perform_syncstatus',
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['running', 'ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? this.$t('db.text_68') : ''
            return {
              validate: selectedLength,
              tooltip: notSelectedTooltip,
            }
          },
        },
        {
          label: this.$t('db.text_213'),
          actions: (obj) => {
            return [
              {
                label: this.$t('compute.text_283'),
                permission: 'mongodbs_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    params: {
                      resources: 'mongodbs',
                    },
                    mode: 'add',
                  })
                },
              },
              {
                label: this.$t('common_277'),
                permission: 'mongodbs_update',
                action: (row) => {
                  this.createDialog('ChangeDisableDelete', {
                    name: this.$t('dictionary.mongodb'),
                    columns: this.columns,
                    onManager: this.onManager,
                    data: this.list.selectedItems,
                  })
                },
              },
              {
                label: this.$t('compute.perform_delete'),
                permission: 'mongodbs_perform_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('compute.text_617'),
                    name: this.$t('dictionary.mongodb'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: '',
                  }
                  const someDisableDelete = this.list.selectedItems.some((item) => {
                    return this.booleanTransfer(item.disable_delete) && this.booleanTransfer(item.protected)
                  })
                  if (someDisableDelete) {
                    ret.tooltip = this.$t('common.text00008')
                    return ret
                  }
                  return this.$getDeleteResult(this.list.selectedItems)
                },
              }]
          },
          meta: () => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? this.$t('db.text_68') : ''
            return {
              validate: selectedLength,
              tooltip: notSelectedTooltip,
            }
          },
        },
      ],
      tagConfigParams: {
        resource: 'mongodbs',
        queryTreeId: 'project-tag-value-tree',
      },
    }
  },
  computed: {
    showActions () {
      return !this.$isScopedPolicyMenuHidden('mongodb_hidden_columns.perform_action')
    },
    exportDataOptions () {
      return {
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        title: this.$t('dictionary.mongodb'),
        downloadType: 'local',
        fixedItems: [
          { key: 'vcpu_count', label: 'CPU' },
          { key: 'disk_size_mb', label: this.$t('table.title.disk') + '(M)' },
          { key: 'vmem_size_mb', label: this.$t('table.title.vmem_size') + '(M)' },
          { key: 'port', label: 'port' },
        ],
      }
    },
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('mongodb-detail')
  },
  methods: {
    getSeachStatus () {
      const selectedStatus = ['running', 'unknown', 'sync_failed']
      const status = []
      for (const key in this.$t('status.redis')) {
        if (selectedStatus.indexOf(key) > -1) {
          status.push({
            key,
            label: this.$t('status.redis')[key],
          })
        }
      }
      return status
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'MongoDBSidePage', {
        id: row.id,
        resource: 'mongodbs',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.mongodb).flat(),
      }, {
        list: this.list,
        tab,
      })
    },
    booleanTransfer (val) {
      if (R.is(String, val)) {
        return val === 'true'
      }
      return val
    },
  },
}
</script>
<style lang="less">
 .td-ellipsis{
    width: 150px;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
 }
</style>

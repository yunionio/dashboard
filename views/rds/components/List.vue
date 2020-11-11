<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions" />
 </template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getNameFilter, getFilter, getTenantFilter, getDomainFilter, getStatusFilter, getBrandFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import globalSearchMixins from '@/mixins/globalSearch'

export default {
  name: 'RDSList',
  mixins: [WindowsMixin, ListMixin, globalSearchMixins, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'dbinstances',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.rds).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('rds'),
          brand: getBrandFilter('rds_engine_brands'),
          // account: getAccountFilter(),
          projects: getTenantFilter(),
          billing_type: getFilter({
            field: 'billing_type',
            title: this.$t('db.text_54'),
            items: [
              { label: this.$t('db.text_55'), key: 'postpaid' },
              { label: this.$t('db.text_56'), key: 'prepaid' },
            ],
          }),
          engine: getFilter({
            field: 'engine',
            title: this.$t('db.text_57'),
            items: [
              { label: 'MySQL', key: 'MySQL' },
              { label: 'PostgreSQL', key: 'PostgreSQL' },
              { label: 'SQLServer', key: 'SQLServer' },
            ],
          }),
          internal_connection_str: getFilter({
            field: 'internal_connection_str',
            title: this.$t('db.text_58'),
          }),
          connection_str: getFilter({
            field: 'connection_str',
            title: this.$t('db.text_59'),
          }),
          region: {
            label: this.$t('db.text_40'),
          },
          project_domains: getDomainFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'vcpu_count', 'account'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('db.text_60'), key: 'name' },
          { label: this.$t('db.text_61'), key: 'category' },
          { label: 'CPU', key: 'vcpu_count' },
          { label: this.$t('db.text_62'), key: 'vmem_size_mb' },
          { label: this.$t('db.text_57'), key: 'engine' },
          { label: this.$t('db.text_63'), key: 'engine_version' },
          { label: this.$t('db.text_64'), key: 'port' },
          { label: this.$t('db.text_65'), key: 'internal_connection_str' },
          { label: this.$t('db.text_66'), key: 'connection_str' },
          { label: this.$t('db.text_67'), key: 'account' },
          { label: this.$t('db.text_54'), key: 'billing_type' },
          { label: this.$t('db.text_46'), key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('db.text_51'), key: 'provider' },
          { label: this.$t('db.text_40'), key: 'region' },
        ],
      },
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'rds_dbinstances_create',
          action: () => {
            this.$router.push('/rds/create')
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: (obj) => {
            const selectedLength = this.list.selectedItems.length
            const notSelectedTooltip = selectedLength <= 0 ? this.$t('db.text_68') : ''
            const isRunning = this.list.selectedItems.every(item => item.status.toLowerCase() === 'running')
            const notRunninTip = !isRunning ? this.$t('db.text_156') : null
            return [
              {
                label: this.$t('db.text_69'),
                action: (obj) => {
                  this.onManager('batchPerformAction', {
                    id: this.list.selectedItems.map(item => item.id),
                    managerArgs: {
                      action: 'sync-status',
                    },
                  })
                },
                meta: () => {
                  return {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                },
              },
              {
                label: this.$t('db.text_70'),
                action: () => {
                  this.createDialog('RDSRestartdialog', {
                    title: this.$t('db.text_70'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  return {
                    validate: selectedLength,
                    tooltip: notSelectedTooltip,
                  }
                },
              },
              {
                label: this.$t('db.text_71'),
                action: () => {
                  this.createDialog('SetDurationDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.dbinstances'),
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  // 包年包月机器，不支持此操作
                  const isSomePrepaid = this.list.selectedItems.some((item) => {
                    return item.billing_type === 'prepaid'
                  })
                  if (isSomePrepaid) {
                    ret.tooltip = this.$t('db.text_72')
                    return ret
                  }
                  // 暂只支持同时操作已设置到期或未设置到期释放的机器
                  const isSomeExpired = this.list.selectedItems.some((item) => {
                    return item.expired_at
                  })
                  const isSomeNotExpired = this.list.selectedItems.some((item) => {
                    return !item.expired_at
                  })
                  if (isSomeExpired && isSomeNotExpired) {
                    ret.tooltip = this.$t('db.text_73')
                    return ret
                  }
                  ret.validate = true
                  return ret
                },
              },
              {
                label: this.$t('db.text_157'),
                action: () => {
                  this.createDialog('RedisRenewDialog', {
                    title: this.$t('db.text_157'),
                    name: this.$t('dictionary.dbinstances'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const isPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
                  const validate = (isRunning && isPrepaid)
                  return {
                    validate: validate,
                    tooltip: notRunninTip || (!isPrepaid ? this.$t('db.text_158') : null),
                  }
                },
              },
              {
                label: this.$t('db.text_351'),
                action: () => {
                  this.createDialog('AutoRenewDialog', {
                    name: this.$t('dictionary.dbinstances'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const isPrepaid = this.list.selectedItems.every(item => item.billing_type === 'prepaid')
                  const validate = (isRunning && isPrepaid)
                  return {
                    validate: validate,
                    tooltip: notRunninTip || (!isPrepaid ? this.$t('db.text_158') : null),
                  }
                },
              },
              disableDeleteAction(this, {
                name: this.$t('dictionary.dbinstances'),
              }),
              {
                label: this.$t('table.action.set_tag'),
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'dbinstance',
                    },
                    tipName: this.$t('dictionary.dbinstance'),
                  })
                },
              },
              {
                label: this.$t('db.text_42'),
                permission: 'rds_dbinstances_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    title: this.$t('db.text_42'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.dbinstances'),
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
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
    }
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')
    this.list.fetchData()
    this.initSidePageTab('detail')
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'RDSSidePage', {
        id: row.id,
        resource: 'dbinstances',
        getParams: {
          details: true,
        },
        steadyStatus: Object.values(expectStatus.rds).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
<style lang="less">
.td-ellipsis {
  width: 150px;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

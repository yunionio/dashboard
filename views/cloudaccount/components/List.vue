<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getEnabledFilter, getStatusFilter, getBrandFilter, getPublicFilter } from '@/utils/common/tableFilter'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'CloudaccountList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudaccounts',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.cloudaccount).flat(),
          sync_status: Object.values(expectStatus.cloudaccountSyncStatus).flat(),
        },
        filterOptions: {
          name: getNameFilter(),
          // access_url: getFilter({
          //   field: 'access_url',
          //   title: '环境',
          // }),
          enabled: getEnabledFilter(),
          status: getStatusFilter('cloudaccount'),
          health_status: getStatusFilter({
            field: 'health_status',
            statusModule: 'cloudaccountHealthStatus',
            title: '健康状态',
          }),
          brand: getBrandFilter(),
          account: {
            label: '账号',
            filter: true,
            formatter: val => {
              return `account.contains("${val}")`
            },
          },
          enable_auto_sync: getEnabledFilter({ label: '自动同步' }),
          share_mode: getPublicFilter(),
          // tenant: getTenantFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '环境', key: 'access_url' },
          { label: '启用状态', key: 'enabled' },
          { label: '状态', key: 'status' },
          { label: '健康状态', key: 'health_status' },
          { label: '虚拟机', key: 'guest_count' },
          { label: '余额', key: 'balance' },
          { label: '宿主机', key: 'host_count' },
          { label: '云账号', key: 'account' },
          { label: '平台', key: 'brand' },
          { label: '自动同步', key: 'enable_auto_sync' },
          { label: '同步时间', key: 'last_auto_sync' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'cloudaccounts_create',
          action: () => {
            this.$router.push({ name: 'CloudaccountCreate' })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            const ownerDomain = this.$store.getters.isAdminMode || this.list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
            return [
              {
                label: '全量同步',
                permission: 'cloudaccounts_perform_sync',
                action: () => {
                  this.list.batchPerformAction('sync', { full_sync: true, force: true }, this.list.steadyStatus)
                },
                meta: () => this.syncPolicy(this.list.selectedItems),
              },
              {
                label: '设置自动同步',
                permission: 'cloudaccounts_perform_enable_auto_sync,cloudaccounts_perform_disable_auto_sync',
                action: () => {
                  this.createDialog('CloudaccountSetAutoSyncDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    steadyStatus: this.list.steadyStatus,
                  })
                },
                meta: () => this.setAutoSyncPolicy(this.list.selectedItems, ownerDomain),
              },
              {
                label: '连接测试',
                permission: 'cloudaccounts_perform_sync',
                action: () => {
                  this.list.batchPerformAction('sync', null, this.list.steadyStatus)
                },
                meta: () => this.syncPolicy(this.list.selectedItems), // 和【全量同步】同逻辑
              },
              ...getEnabledSwitchActions(this, undefined, ['cloudaccounts_perform_enable', 'cloudaccounts_perform_disable'], {
                metas: [
                  () => {
                    const isDisable = !!this.list.selectedItems.find(item => !item.enabled)
                    return {
                      validate: this.list.selectedItems.length && ownerDomain && isDisable,
                    }
                  },
                  () => {
                    const isEnable = !!this.list.selectedItems.find(item => item.enabled)
                    return {
                      validate: this.list.selectedItems.length && ownerDomain && isEnable,
                    }
                  },
                ],
              }),
              {
                label: '删除',
                permission: 'cloudaccounts_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除云账号',
                    name: this.$t('dictionary.cloudaccount'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const deleteResult = this.$getDeleteResult(this.list.selectedItems)
                  if (!deleteResult.validate) {
                    return deleteResult
                  }
                  return {
                    validate: ownerDomain,
                  }
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length > 0,
            }
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
    this.initSidePageTab('cloudaccount-detail')
    this.list.fetchData()
    this.$bus.$on('CloudAccountListSingleRefresh', args => {
      this.list.singleRefresh(...args)
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CloudaccountSidePage', {
        id: row.id,
        resource: 'cloudaccounts',
        getParams: this.getParams,
        refresh: this.refresh,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

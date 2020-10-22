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
import { getNameFilter, getEnabledFilter, getStatusFilter, getBrandFilter, getPublicFilter, getDomainFilter } from '@/utils/common/tableFilter'
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
    isAllowCreate: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      batchDeleteBill: true,
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
            title: this.$t('cloudenv.text_93'),
          }),
          brand: getBrandFilter(),
          account: {
            label: this.$t('cloudenv.text_94'),
            filter: true,
            formatter: val => {
              return `account.contains(${val})`
            },
          },
          enable_auto_sync: getEnabledFilter({ label: this.$t('cloudenv.text_83') }),
          share_mode: getPublicFilter(),
          project_domains: getDomainFilter(),
        },
        hiddenColumns: ['guest_count', 'host_count', 'enable_auto_sync', 'probe_at', 'last_auto_sync', 'access_url'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('cloudenv.text_96'), key: 'access_url' },
          { label: this.$t('cloudenv.text_97'), key: 'enabled' },
          { label: this.$t('cloudenv.text_98'), key: 'status' },
          { label: this.$t('cloudenv.text_93'), key: 'health_status' },
          { label: this.$t('cloudenv.text_99'), key: 'guest_count' },
          { label: this.$t('cloudenv.text_100'), key: 'balance' },
          { label: this.$t('cloudenv.text_101'), key: 'host_count' },
          { label: this.$t('cloudenv.text_12'), key: 'account' },
          { label: this.$t('cloudenv.text_102'), key: 'brand' },
          { label: this.$t('cloudenv.text_83'), key: 'enable_auto_sync' },
          { label: this.$t('cloudenv.text_103'), key: 'last_auto_sync' },
          {
            label: this.$t('compute.text_505'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('cloudaccounts'))
            },
          },
        ],
      },
      groupActions: [
        {
          label: this.$t('cloudenv.text_104'),
          permission: 'cloudaccounts_create',
          action: () => {
            this.$router.push({ name: 'CloudaccountCreate' })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: this.isAllowCreate,
            }
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            const ownerDomain = this.$store.getters.isAdminMode || this.list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
            return [
              {
                label: this.$t('cloudenv.text_105'),
                permission: 'cloudaccounts_perform_sync',
                action: () => {
                  this.list.batchPerformAction('sync', { full_sync: true, force: true }, this.list.steadyStatus)
                },
                meta: () => this.syncPolicy(this.list.selectedItems),
              },
              {
                label: this.$t('cloudenv.text_106'),
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
                label: this.$t('cloudenv.text_107'),
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
                label: this.$t('cloudenv.text_108'),
                permission: 'cloudaccounts_delete',
                action: () => {
                  const supportBillBrands = ['Aws', 'Aliyun', 'Google', 'Huawei', 'Azure', 'Qcloud']
                  const supportBill = this.list.selectedItems.some(item => {
                    return supportBillBrands.includes(item.brand)
                  })
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('cloudenv.text_109'),
                    name: this.$t('dictionary.cloudaccount'),
                    onManager: this.onManager,
                    content: () => {
                      if (supportBill) {
                        return <a-checkbox v-model={ this.batchDeleteBill }>{ this.$t('cloudenv.text_497') }</a-checkbox>
                      }
                      return null
                    },
                    success: async () => {
                      if (supportBill && this.batchDeleteBill) {
                        const manager = new this.$Manager('bill_tasks', 'v1')
                        try {
                          const p = this.list.selectedItems.filter(item => {
                            return supportBillBrands.includes(item.brand)
                          }).map(item => {
                            return manager.create({
                              data: {
                                task_type: 'bill_remove',
                                cloudaccount_id: item.id,
                              },
                            })
                          })
                          await Promise.all(p)
                        } catch (err) {
                          throw err
                        }
                      }
                      this.batchDeleteBill = true
                    },
                    cancel: () => {
                      this.batchDeleteBill = true
                    },
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

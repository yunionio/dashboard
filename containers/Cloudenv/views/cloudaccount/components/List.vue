<template>
  <page-list
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :show-single-actions="!isTemplate"
    :export-data-options="exportDataOptions"
    :show-page="!isTemplate" />
</template>

<script>
import * as R from 'ramda'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getEnabledFilter, getStatusFilter, getBrandFilter, getPublicFilter, getDomainFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import GlobalSearchMixin from '@/mixins/globalSearch'
import { typeClouds } from '@/utils/common/hypervisor'
import { isCE } from '@/utils/utils'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

const providerMap = typeClouds.getProviderlowcase()

export default {
  name: 'CloudaccountList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
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
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      batchDeleteBill: true,
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'cloudaccounts',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: {
          status: Object.values(expectStatus.cloudaccount).flat(),
          sync_status: Object.values(expectStatus.cloudaccountSyncStatus).flat(),
        },
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
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
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['guest_count', 'host_count', 'enable_auto_sync', 'probe_at', 'access_url', 'created_at'],
      }),
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
          hidden: () => this.hiddenActions.includes('create'),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            const ownerDomain = this.$store.getters.isAdminMode || this.list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
            return [
              {
                label: this.$t('cloudenv.sync_account'),
                permission: 'cloudaccounts_perform_sync',
                action: () => {
                  // this.list.batchPerformAction('sync', { full_sync: true, force: true }, this.list.steadyStatus)
                  this.createDialog('FullSyncResourceDialog', {
                    title: this.$t('cloudenv.sync_account'),
                    name: this.$t('common.account'),
                    action: this.$t('cloudenv.sync_account'),
                    steadyStatus: this.list.steadyStatus,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => this.syncPolicy(this.list.selectedItems),
              },
              // {
              //   label: this.$t('cloudenv.text_106'),
              //   permission: 'cloudaccounts_perform_enable_auto_sync,cloudaccounts_perform_disable_auto_sync',
              //   action: () => {
              //     this.createDialog('CloudaccountSetAutoSyncDialog', {
              //       data: this.list.selectedItems,
              //       columns: this.columns,
              //       onManager: this.onManager,
              //       steadyStatus: this.list.steadyStatus,
              //     })
              //   },
              //   meta: () => this.setAutoSyncPolicy(this.list.selectedItems, ownerDomain),
              // },
              {
                label: this.$t('cloudenv.text_107'),
                permission: 'cloudaccounts_perform_sync',
                action: () => {
                  this.list.batchPerformAction('sync', null, this.list.steadyStatus)
                },
                meta: () => this.syncPolicy(this.list.selectedItems), // 和【全量同步】同逻辑
              },
              {
                label: this.$t('cloudenv.read_only'),
                permission: 'cloudaccounts_update',
                action: () => {
                  this.createDialog('CloudaccountSetReadOnlyDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: !this.list.selectedItems.some(item => {
                      return [
                        providerMap.vmware.key,
                        providerMap.jdcloud.key,
                        providerMap.ecloud.key,
                        providerMap.s3.key,
                        providerMap.ceph.key,
                        providerMap.xsky.key,
                      ].includes(item.brand)
                    }),
                  }
                },
              },
              {
                label: this.$t('cloudenv.set_project_mapping'),
                permission: 'cloudaccounts_perform_project_mapping',
                action: () => {
                  this.createDialog('CloudaccountSetPojectmappingDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: !!this.list.selectedItems.length,
                  }
                },
              },
              {
                label: this.$t('cloudenv.action.update_credential'),
                permission: 'cloudaccounts_update',
                action: () => {
                  this.createDialog('CloudaccountRerunBillDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = { validate: !!this.list.selectedItems.length }
                  if (!ret.validate) return ret
                  this.list.selectedItems.map(obj => {
                    const ownerDomain = this.isAdminMode || obj.domain_id === this.userInfo.projectDomainId
                    if (!ownerDomain) {
                      ret.validate = false
                    }
                    if (obj.status === 'deleted') {
                      ret.validate = false
                    }
                    if (!obj.tenant_id) {
                      ret.validate = false
                      ret.tooltip = this.$t('bill.please_set_project_mapping')
                    }
                  })
                  return ret
                },
                hidden: () => isCE() || this.$store.getters.isSysCE,
              },
              ...getEnabledSwitchActions(this, undefined, ['cloudaccounts_perform_enable', 'cloudaccounts_perform_disable'], {
                actions: [
                  async (obj) => {
                    const ids = this.list.selectedItems.map(item => item.id)
                    await this.onManager('batchPerformAction', {
                      id: ids,
                      managerArgs: {
                        action: 'enable',
                      },
                    })
                    this.$store.dispatch('auth/getCapabilities')
                  },
                  async (obj) => {
                    const ids = this.list.selectedItems.map(item => item.id)
                    await this.onManager('batchPerformAction', {
                      id: ids,
                      managerArgs: {
                        action: 'disable',
                      },
                    })
                    this.$store.dispatch('auth/getCapabilities')
                  },
                ],
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
                  const supportBillBrands = ['Aws', 'Aliyun', 'Google', 'Huawei', 'Azure', 'Qcloud', 'Ksyun']
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
                      if (supportBill && this.$appConfig.isPrivate && !this.$store.getters.isSysCE) {
                        return <a-checkbox v-model={ this.batchDeleteBill }>{ this.$t('cloudenv.text_497') }</a-checkbox>
                      }
                      return null
                    },
                    success: async () => {
                      if (supportBill && this.batchDeleteBill && this.$appConfig.isPrivate && !this.$store.getters.isSysCE) {
                        const manager = new this.$Manager('billtasks/submit', 'v1')
                        try {
                          const p = this.list.selectedItems.filter(item => {
                            return supportBillBrands.includes(item.brand)
                          }).map(item => {
                            return manager.create({
                              data: {
                                task_type: 'delete_bill',
                                account_id: item.id,
                              },
                            })
                          })
                          await Promise.all(p)
                        } catch (err) {
                          throw err
                        }
                      }
                      this.batchDeleteBill = true
                      this.$store.dispatch('auth/getCapabilities')
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
  computed: {
    exportDataOptions () {
      return {
        title: this.$t('cloudenv.text_12'),
        downloadType: 'local',
        items: this.columns,
        hiddenFields: ['resource_tenant'],
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
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'CloudaccountSidePage', {
        id: row.id,
        resource: 'cloudaccounts',
        getParams: this.getParams,
        refresh: this.refresh,
      }, {
        list: this.list,
        hiddenActions: this.hiddenActions,
        tab,
      })
    },
  },
}
</script>

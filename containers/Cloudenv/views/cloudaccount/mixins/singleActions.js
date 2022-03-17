import { mapGetters } from 'vuex'
import { changeToArr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
import { findPlatform, getDisabledProvidersActionMeta } from '@/utils/common/hypervisor'
import { hasMeterService } from '@/utils/auth'

const steadyStatus = {
  status: Object.values(expectStatus.cloudaccount).flat(),
  sync_status: Object.values(expectStatus.cloudaccountSyncStatus).flat(),
}

export default {
  data () {
    return {
      deleteBill: true,
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable', 'userInfo', 'isAdminMode']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.sync_account'),
        permission: 'cloudaccounts_perform_sync',
        action: (obj) => {
          // this.onManager('performAction', {
          //   id: obj.id,
          //   steadyStatus,
          //   managerArgs: {
          //     action: 'sync',
          //     data: {
          //       full_sync: true,
          //       force: true,
          //     },
          //   },
          // }).then(res => {
          //   this.$message.success(this.$t('cloudenv.text_381'))
          // })
          this.createDialog('FullSyncResourceDialog', {
            title: this.$t('cloudenv.sync_account'),
            name: this.$t('common.account'),
            action: this.$t('cloudenv.sync_account'),
            steadyStatus,
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            callback: () => {
              this.$message.success(this.$t('cloudenv.text_381'))
            },
          })
        },
        meta: (obj) => this.syncPolicy(obj),
      },
      {
        label: i18n.t('cloudenv.text_311'),
        actions: obj => {
          const ownerDomain = this.isAdminMode || obj.domain_id === this.userInfo.projectDomainId
          return [
            {
              label: i18n.t('cloudenv.text_106'),
              permission: 'cloudaccounts_perform_enable_auto_sync,cloudaccounts_perform_disable_auto_sync',
              action: () => {
                this.sidePageTriggerHandle(this, 'CloudaccountSidePage', {
                  id: obj.id,
                  resource: 'cloudaccounts',
                  getParams: this.getParams,
                  refresh: this.refresh,
                }, {
                  tab: 'scheduledtasks-list',
                  list: this.list,
                  hiddenActions: this.hiddenActions,
                })
              },
              meta: () => this.setAutoSyncPolicy(obj, ownerDomain),
            },
            {
              label: i18n.t('cloudenv.text_298'),
              permission: 'cloudaccounts_perform_update_credential',
              action: obj => {
                this.createDialog('CloudaccountUpdateDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: obj => {
                let tooltip
                if (!obj.enabled) tooltip = i18n.t('cloudenv.text_312')
                return {
                  validate: obj.enabled && ownerDomain,
                  tooltip,
                }
              },
            },
            {
              label: i18n.t('cloudenv.text_168'),
              permission: 'cloudaccounts_perform_update_credential',
              action: obj => {
                this.$router.push({
                  name: 'CloudaccountUpdateBill',
                  query: {
                    id: obj.id,
                    provider: obj.provider,
                  },
                })
              },
              meta: obj => {
                return {
                  validate: this.$appConfig.isPrivate && ['Aws', 'Aliyun', 'Google', 'Huawei', 'Azure', 'Qcloud', 'JDcloud'].indexOf(obj.brand) > -1 && ownerDomain,
                }
              },
              hidden: !this.$appConfig.isPrivate,
            },
            {
              label: i18n.t('cloudenv.text_107'),
              permission: 'cloudaccounts_perform_sync',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  steadyStatus,
                  managerArgs: {
                    action: 'sync',
                  },
                })
              },
              meta: () => {
                let tooltip
                if (!obj.enabled) tooltip = i18n.t('cloudenv.text_312')
                let canSync = true
                if (obj.enable_auto_sync && obj.sync_status !== 'idle') {
                  canSync = false
                  tooltip = i18n.t('cloudenv.text_313')
                }
                return {
                  validate: (obj.enabled && canSync) && ownerDomain,
                  tooltip,
                }
              },
            },
            {
              label: i18n.t('cloudaccount.table.action.set_discount'),
              permission: 'price_infos_perform_discount',
              action: () => {
                this.createDialog('CloudaccountSetDiscountDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => {
                const ownerDomain = this.isAdminMode || obj.domain_id === this.userInfo.projectDomainId
                const isPublic = findPlatform(obj.brand.toLowerCase()) === 'public'
                const ret = {
                  validate: true,
                }
                if (!isPublic) {
                  ret.validate = false
                  ret.tooltip = this.$t('cloudaccount.tooltip.disable_set_discount')
                  return ret
                }
                if (!ownerDomain) {
                  ret.validate = false
                  ret.tooltip = this.$t('common.share', [this.$t('cloudenv.text_12')])
                  return ret
                }
                return ret
              },
              extraMeta: obj => {
                return getDisabledProvidersActionMeta({
                  row: obj,
                  disabledProviders: ['BingoCloud'],
                })
              },
              hidden: () => {
                return !hasMeterService()
              },
            },
            {
              label: i18n.t('cloudenv.text_281'),
              permission: 'cloudaccounts_perform_public',
              action: () => {
                this.createDialog('CloudaccountSetShareDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  steadyStatus,
                })
              },
              meta: () => {
                let tooltip = ''
                if (!this.l3PermissionEnable) {
                  tooltip = i18n.t('cloudenv.text_314')
                } else if (!this.isAdminMode) {
                  tooltip = i18n.t('cloudenv.text_315')
                }
                return {
                  validate: this.l3PermissionEnable && this.isAdminMode,
                  tooltip,
                }
              },
            },
            {
              label: i18n.t('cloudenv.text_316'),
              permission: 'cloudaccounts_update',
              action: () => {
                this.createDialog('UpdateProxySettingDialog', {
                  title: i18n.t('cloudenv.text_316'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => {
                return {
                  validate: ownerDomain,
                }
              },
            },
            {
              label: i18n.t('cloudenv.text_576'),
              permission: 'cloudaccounts_update',
              action: () => {
                this.onManager('update', {
                  id: obj.id,
                  managerArgs: {
                    data: {
                      saml_auth: true,
                    },
                  },
                })
              },
              meta: () => {
                let tooltip
                if (obj.saml_auth) tooltip = this.$t('cloudaccount.tooltip.already_enable_sso')
                const isSupportSAMLAuth = ['Aws', 'Aliyun', 'Huawei', 'Qcloud', 'Azure', 'HCSO'].includes(obj.brand)
                if (!isSupportSAMLAuth) tooltip = this.$t('cloudaccount.tooltip.not_support_sso', [obj.brand])
                if (obj.brand === 'Azure' && obj.access_url !== 'AzurePublicCloud') {
                  let txt
                  Object.keys(i18n.t('cloudAccountAccessType')).forEach(k => {
                    if (obj.access_url.indexOf(k) > -1) {
                      txt = i18n.t('cloudAccountAccessType')[k]
                    }
                  })
                  tooltip = this.$t('cloudaccount.tooltip.not_support_sso', [`${obj.brand} ${txt}`])
                  return { validate: false, tooltip }
                }
                return {
                  validate: !obj.saml_auth && ownerDomain && isSupportSAMLAuth,
                  tooltip,
                }
              },
            },
            ...getEnabledSwitchActions(this, obj, ['cloudaccounts_perform_enable', 'cloudaccounts_perform_disable'], {
              actions: [
                async (obj) => {
                  await this.onManager('batchPerformAction', {
                    id: [obj.id],
                    managerArgs: {
                      action: 'enable',
                    },
                  })
                  this.$store.dispatch('auth/getCapabilities')
                },
                async (obj) => {
                  await this.onManager('batchPerformAction', {
                    id: [obj.id],
                    managerArgs: {
                      action: 'disable',
                    },
                  })
                  this.$store.dispatch('auth/getCapabilities')
                },
              ],
              metas: [
                () => {
                  return {
                    validate: !obj.enabled && ownerDomain,
                  }
                },
                () => {
                  return {
                    validate: obj.enabled && ownerDomain,
                  }
                },
              ],
            }),
            {
              label: i18n.t('cloudenv.text_108'),
              permission: 'cloudaccounts_delete',
              action: () => {
                const supportBill = ['Aws', 'Aliyun', 'Google', 'Huawei', 'Azure', 'Qcloud'].includes(obj.brand)
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('cloudenv.text_109'),
                  name: this.$t('dictionary.cloudaccount'),
                  onManager: this.onManager,
                  content: () => {
                    if (supportBill) {
                      return <a-checkbox v-model={ this.deleteBill }>{ this.$t('cloudenv.text_497') }</a-checkbox>
                    }
                    return null
                  },
                  success: async () => {
                    if (supportBill && this.deleteBill) {
                      const manager = new this.$Manager('bill_tasks', 'v1')
                      try {
                        const data = {
                          task_type: 'bill_remove',
                          cloudaccount_id: obj.id,
                        }
                        await manager.create({
                          data,
                        })
                      } catch (err) {
                        throw err
                      }
                    }
                    this.deleteBill = true
                    this.$store.dispatch('auth/getCapabilities')
                  },
                  cancel: () => {
                    this.deleteBill = true
                  },
                })
              },
              meta: () => {
                const deleteResult = this.$getDeleteResult(obj)
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
      },
    ]
  },
  methods: {
    syncPolicy (item) {
      let tooltip
      const items = changeToArr(item)
      if (!items.length) return { validate: false }
      const enabledValid = items.every(obj => {
        if (!obj.enabled) {
          tooltip = i18n.t('cloudenv.text_312')
          return false
        }
        return true
      })
      const autoSyncValid = items.every(obj => {
        if (obj.enable_auto_sync && obj.sync_status !== 'idle') {
          tooltip = i18n.t('cloudenv.text_313')
          return false
        }
        return true
      })
      const ownerDomain = this.isAdminMode || items.every(obj => obj.domain_id === this.userInfo.projectDomainId)
      return {
        validate: enabledValid && autoSyncValid && ownerDomain,
        tooltip,
      }
    },
    setAutoSyncPolicy (item, ownerDomain) {
      let tooltip
      const items = changeToArr(item)
      if (!items.length) return { validate: false }
      const enabledValid = items.every(obj => {
        if (!obj.enabled) {
          tooltip = i18n.t('cloudenv.text_312')
          return false
        }
        return true
      })
      return {
        validate: enabledValid && ownerDomain,
        tooltip,
      }
    },
  },
}

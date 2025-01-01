import { mapGetters } from 'vuex'
import { changeToArr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
import { findPlatform, getDisabledProvidersActionMeta, typeClouds } from '@/utils/common/hypervisor'
import { hasMeterService, hasSetupKey, billSupportBrands } from '@/utils/auth'
import { BRAND_MAP, CLOUD_ENVS } from '@/constants'
import { CLOUDACCOUNT_TYPES } from '@Cloudenv/views/cloudaccount/constants'
import setting from '@/config/setting'

const steadyStatus = {
  status: Object.values(expectStatus.cloudaccount).flat(),
  sync_status: Object.values(expectStatus.cloudaccountSyncStatus).flat(),
}
const providerMap = typeClouds.getProviderlowcase()

export default {
  data () {
    return {
      deleteBill: true,
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable', 'userInfo', 'isAdminMode']),
    globalSettingSetupKeys () {
      const { globalSetting } = this.$store.state
      if (globalSetting && globalSetting.value) {
        return globalSetting.value.setupKeys
      }
      return undefined
    },
    types () {
      const typesMap = {}
      for (const box in CLOUDACCOUNT_TYPES) {
        for (const brand in CLOUDACCOUNT_TYPES[box]) {
          if (hasSetupKey([brand])) {
            if (!typesMap[box]) {
              typesMap[box] = {
                [brand]: CLOUDACCOUNT_TYPES[box][brand],
              }
            } else {
              typesMap[box][brand] = CLOUDACCOUNT_TYPES[box][brand]
            }
            if (brand === 'cloudpods') {
              const { companyInfo = {} } = this.$store.state.app
              const { inner_copyright_en, inner_copyright, inner_logo, inner_logo_format } = companyInfo
              CLOUDACCOUNT_TYPES[box][brand].name = setting.language === 'en' ? (inner_copyright_en || CLOUDACCOUNT_TYPES[box][brand].name) : (inner_copyright || CLOUDACCOUNT_TYPES[box][brand].name)
              CLOUDACCOUNT_TYPES[box][brand].logo = inner_logo && inner_logo_format ? `data:${inner_logo_format};base64,${inner_logo}` : CLOUDACCOUNT_TYPES[box][brand].logo
            }
          }
        }
      }
      if (hasSetupKey(['bill']) && !hasSetupKey(['onecloud', 'public', 'private', 'vmware', 'storate'])) {
        const setUpKeys = this.globalSettingSetupKeys || []
        const billTargetItems = billSupportBrands.filter(key => setUpKeys.includes('bill_' + key))
        if (!billTargetItems.length) {
          // 旧版本 license只签发bill
          if (!hasSetupKey('public')) {
            if (!typesMap.public) {
              typesMap.public = {}
            }
            billSupportBrands.map(key => {
              typesMap.public[key] = CLOUDACCOUNT_TYPES.public[key]
            })
          }
        } else {
          // 新版本 license签发billItem
          typesMap.public = typesMap.public || {}
          billTargetItems.map(key => {
            typesMap.public[key] = CLOUDACCOUNT_TYPES.public[key]
          })
        }
      }
      return typesMap
    },
  },
  created () {
    this.singleActions = [
      // 同步云账号
      {
        label: i18n.t('cloudenv.sync_account'),
        permission: 'cloudaccounts_perform_sync',
        action: (obj) => {
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
        meta: (obj) => {
          if (obj.sync_status !== 'idle') {
            return {
              validate: false,
              tooltip: this.$t('cloudenv.syncing_account_disable_action'),
            }
          }
          return this.syncPolicy(obj)
        },
      },
      {
        label: i18n.t('common.more'),
        actions: (obj) => {
          const ownerDomain = this.isAdminMode || obj.domain_id === this.userInfo.projectDomainId

          return [
            // 状态设置
            {
              label: i18n.t('cloudenv.action_group.set_status'),
              submenus: [
                // 启用、禁用
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
                // 连接测试
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
              ],
            },
            // 属性设置
            {
              label: i18n.t('cloudenv.action_group.set_props'),
              submenus: [
                // 设置自动同步
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
                // 设置同步策略
                {
                  label: this.$t('cloudenv.set_project_mapping'),
                  permission: 'cloudaccounts_perform_project_mapping',
                  action: (obj) => {
                    this.createDialog('CloudaccountSetPojectmappingDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      projectParams: { domain_id: obj.domain_id },
                    })
                  },
                },
                // 更新账号
                {
                  label: i18n.t('cloudenv.action.update_account'),
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
                // 克隆账号
                {
                  label: i18n.t('cloudenv.action.clone_account'),
                  permission: 'cloudaccounts_create',
                  action: obj => {
                    this.$router.push({ name: 'CloudaccountCreate', params: obj })
                  },
                  // 查看当前云是否允许创建
                  meta: obj => {
                    let validate = false
                    const values = Object.values(this.types)
                    if (obj.provider) {
                      values.map(item => {
                        const brands = Object.values(item)
                        if (brands.some(l => l.provider === obj.provider)) {
                          validate = true
                        }
                      })
                    }
                    return {
                      validate,
                    }
                  },
                  hidden: () => this.hiddenActions.includes('create'),
                },
                // 只读模式
                {
                  label: i18n.t('cloudenv.read_only'),
                  permission: 'cloudaccounts_update',
                  action: () => {
                    this.createDialog('CloudaccountSetReadOnlyDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: obj => {
                    return {
                      validate: ![
                        providerMap.vmware.key,
                        providerMap.jdcloud.key,
                        providerMap.ecloud.key,
                        providerMap.s3.key,
                        providerMap.ceph.key,
                        providerMap.xsky.key,
                      ].includes(obj.brand),
                    }
                  },
                },
                // 开启免密登录
                {
                  label: i18n.t('cloudenv.setup_ssh_authentication'),
                  permission: 'cloudaccounts_update',
                  action: () => {
                    this.createDialog('CloudaccountSetSamlAuthDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    let tooltip
                    const isSupportSAMLAuth = ['Aws', 'Aliyun', 'Huawei', 'Qcloud', 'Azure', 'HCSO', 'HCS'].includes(obj.brand)
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
                      validate: ownerDomain && isSupportSAMLAuth,
                      tooltip,
                    }
                  },
                },
                // 设置共享
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
                    let validate = this.l3PermissionEnable && this.isAdminMode
                    if (!this.l3PermissionEnable) {
                      tooltip = i18n.t('cloudenv.text_314')
                    } else if (!this.isAdminMode) {
                      tooltip = i18n.t('cloudenv.text_315')
                    }
                    if (obj.sync_status !== 'idle' || obj.sync_status2 !== 'idle') {
                      validate = false
                      tooltip = i18n.t('cloudenv.syncing_account_disable_action')
                    }
                    return {
                      validate,
                      tooltip,
                    }
                  },
                },
                // 设置代理
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
              ],
            },
            // 费用设置
            {
              label: i18n.t('cloudenv.action_group.set_fee'),
              submenus: [
                // 更新账单
                {
                  label: i18n.t('cloudenv.action.update_credential'),
                  permission: 'cloudaccounts_perform_update_credential',
                  action: obj => {
                    this.$router.push({
                      name: 'CloudaccountUpdateBill',
                      query: {
                        id: obj.id,
                        provider: obj.provider,
                        backPath: '/cloudaccount',
                      },
                    })
                  },
                  meta: obj => {
                    const supportBrands = [
                      ...billSupportBrands,
                      BRAND_MAP.Ksyun.key,
                    ]

                    return {
                      validate: this.$appConfig.isPrivate &&
                        (supportBrands.some(key => key.toLowerCase() === (obj.brand || '').toLowerCase()) || obj.cloud_env === CLOUD_ENVS.private) &&
                        ownerDomain,
                    }
                  },
                  hidden: !this.$appConfig.isPrivate || this.$store.getters.isSysCE,
                },
                // 设置优惠率
                {
                  label: i18n.t('cloudaccount.table.action.set_discount'),
                  permission: 'prices_perform_discount',
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
                      disabledProviders: ['BingoCloud', 'VolcEngine'],
                    })
                  },
                  hidden: () => {
                    return !hasMeterService()
                  },
                },
              ],
            },
            // 删除
            {
              label: i18n.t('common.delete'),
              submenus: [
                // 删除
                {
                  label: i18n.t('common.delete'),
                  permission: 'cloudaccounts_delete',
                  action: () => {
                    this.createDialog('DeleteResDialog', {
                      vm: this,
                      data: [obj],
                      columns: this.columns,
                      title: i18n.t('cloudenv.text_109'),
                      name: this.$t('dictionary.cloudaccount'),
                      onManager: this.onManager,
                      content: () => {
                        if (this.$appConfig.isPrivate && !this.$store.getters.isSysCE) {
                          return <a-checkbox v-model={this.deleteBill}>{this.$t('cloudenv.text_497')}</a-checkbox>
                        }
                        return null
                      },
                      success: async () => {
                        if (this.deleteBill && this.$appConfig.isPrivate && !this.$store.getters.isSysCE) {
                          const manager = new this.$Manager('billtasks/submit', 'v1')
                          try {
                            const data = {
                              task_type: 'delete_bill',
                              account_id: obj.id,
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
              ],
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

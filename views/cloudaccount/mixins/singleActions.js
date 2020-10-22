import { mapGetters } from 'vuex'
import { changeToArr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

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
    ...mapGetters(['l3PermissionEnable']),
  },
  created () {
    this.singleActions = [
      {
        label: '全量同步',
        permission: 'cloudaccounts_perform_sync',
        action: (obj) => {
          this.onManager('performAction', {
            id: obj.id,
            steadyStatus,
            managerArgs: {
              action: 'sync',
              data: {
                full_sync: true,
                force: true,
              },
            },
          })
        },
        meta: (obj) => this.syncPolicy(obj),
      },
      {
        label: '更多',
        actions: obj => {
          const ownerDomain = this.$store.getters.isAdminMode || obj.domain_id === this.$store.getters.userInfo.projectDomainId
          return [
            {
              label: '设置自动同步',
              permission: 'cloudaccounts_update,cloudaccounts_perform_enable_auto_sync,cloudaccounts_perform_disable_auto_sync',
              action: () => {
                this.createDialog('CloudaccountSetAutoSyncDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  steadyStatus,
                })
              },
              meta: () => this.setAutoSyncPolicy(obj, ownerDomain),
            },
            {
              label: '更新账号密码',
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
                if (!obj.enabled) tooltip = '请先启用云账号'
                return {
                  validate: obj.enabled && ownerDomain,
                  tooltip,
                }
              },
            },
            {
              label: '更新账单文件',
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
                  validate: this.$appConfig.isPrivate && ['Aws', 'Aliyun', 'Google', 'Huawei', 'Azure', 'Qcloud'].indexOf(obj.brand) > -1 && ownerDomain,
                }
              },
            },
            {
              label: '连接测试',
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
                if (!obj.enabled) tooltip = '请先启用云账号'
                if (obj.enable_auto_sync) tooltip = '请先取消设置自动同步'
                return {
                  validate: (obj.enabled && !obj.enable_auto_sync) && ownerDomain,
                  tooltip,
                }
              },
            },
            {
              label: '设置共享',
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
                  tooltip = '未开启三级权限，无法操作'
                } else if (!this.$store.getters.isAdminMode) {
                  tooltip = '仅系统管理后台下可以操作'
                }
                return {
                  validate: this.l3PermissionEnable && this.$store.getters.isAdminMode,
                  tooltip,
                }
              },
            },
            {
              label: '设置代理',
              permission: 'proxysettings_list',
              action: () => {
                this.createDialog('UpdateProxySettingDialog', {
                  title: '设置代理',
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
            ...getEnabledSwitchActions(this, obj, ['cloudaccounts_perform_enable', 'cloudaccounts_perform_disable'], {
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
              label: '删除',
              permission: 'cloudaccounts_delete',
              action: () => {
                const supportBill = ['Aws', 'Aliyun', 'Google', 'Huawei', 'Azure', 'Qcloud'].includes(obj.brand)
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: '删除云账号',
                  name: this.$t('dictionary.cloudaccount'),
                  onManager: this.onManager,
                  content: () => {
                    if (supportBill) {
                      return <a-checkbox v-model={ this.deleteBill }>同时删除历史账单数据</a-checkbox>
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
          tooltip = '请先启用云账号'
          return false
        }
        return true
      })
      const autoSyncValid = items.every(obj => {
        if (obj.enable_auto_sync) {
          tooltip = '请先取消设置自动同步'
          return false
        }
        return true
      })
      const ownerDomain = this.$store.getters.isAdminMode || items.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)
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
          tooltip = '请先启用云账号'
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

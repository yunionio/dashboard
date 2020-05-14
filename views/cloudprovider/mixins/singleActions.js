import { mapGetters } from 'vuex'
import { changeToArr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'

const steadyStatus = Object.values(expectStatus.cloudaccount).flat()

export default {
  computed: {
    ...mapGetters(['l3PermissionEnable']),
  },
  created () {
    const ownerDomain = obj => this.$store.getters.isAdminMode || obj.domain_id === this.$store.getters.userInfo.projectDomainId
    const isAccountDomain = data => data.share_mode === 'account_domain'
    this.singleActions = [
      {
        label: `更改${this.$t('dictionary.project')}`,
        action: obj => {
          if (isAccountDomain(this.data)) {
            this.createDialog('ChangeProjectDialog', {
              name: this.$t('dictionary.cloudprovider'),
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
              projectLabel: `资源默认归属${this.$t('dictionary.project')}`,
              formItemLayout: {
                wrapperCol: {
                  span: 19,
                },
                labelCol: {
                  span: 5,
                },
              },
            })
          } else {
            this.createDialog('ChangeOwenrDialog', {
              name: this.$t('dictionary.cloudprovider'),
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
              action: 'change-project',
              projectLabel: `资源默认归属${this.$t('dictionary.project')}`,
              alertMessage: `更改${this.$t('dictionary.project')}时若同时修改${this.$t('dictionary.domain')}，该订阅所属${this.$t('dictionary.domain')}会同步修改`,
              formItemLayout: {
                wrapperCol: {
                  span: 19,
                },
                labelCol: {
                  span: 5,
                },
              },
              resource: 'cloudproviders',
            })
          }
        },
        meta: obj => {
          let tooltip
          if (!obj.enabled) tooltip = '请先启用'
          return {
            validate: obj.enabled && ownerDomain(obj),
            tooltip,
          }
        },
      },
      {
        label: '全量同步',
        action: obj => {
          this.onManager('performAction', {
            id: obj.id,
            steadyStatus: {
              status: steadyStatus,
              sync_status: ['idle'],
            },
            managerArgs: {
              action: 'sync',
              params: {
                full_sync: true,
              },
            },
          }).then(() => {
            // 订阅同步后，云账号也要同步
            this.cloudaccountListRefresh && this.cloudaccountListRefresh()
          })
        },
        meta: obj => {
          let tooltip
          let validate = true
          if (!ownerDomain(obj)) {
            tooltip = '权限不足'
            validate = false
          }
          if (!obj.enabled) {
            tooltip = '请先启用'
            validate = false
          }
          if (this.data.enable_auto_sync) {
            tooltip = '请先取消设置自动同步'
            validate = false
          }
          return {
            tooltip,
            validate,
          }
        },
      },
      {
        label: '更多',
        actions: obj => {
          return [
            {
              label: '启用',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  managerArgs: {
                    action: 'enable',
                  },
                })
              },
              meta: () => {
                return {
                  validate: !obj.enabled && ownerDomain(obj),
                }
              },
            },
            {
              label: '禁用',
              action: () => {
                this.onManager('performAction', {
                  id: obj.id,
                  managerArgs: {
                    action: 'disable',
                  },
                })
              },
              meta: () => {
                return {
                  validate: obj.enabled && ownerDomain(obj),
                }
              },
            },
          ]
        },
      },
    ]
  },
  methods: {
    syncPolicy (item, ownerDomain) {
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

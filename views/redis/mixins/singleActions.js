import { disableDeleteAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: '同步状态',
        action: (obj) => {
          this.onManager('performAction', {
            id: obj.id,
            steadyStatus: 'running',
            managerArgs: {
              action: 'Sync',
            },
          })
        },
      },
      {
        label: '更多',
        actions: (obj) => {
          const { provider, status } = obj
          const isRunning = status.toLowerCase() === 'running'
          const notRunninTip = !isRunning ? '仅运行中的实例支持此操作' : null
          const isAuthModeOn = obj.auth_mode === 'on'
          const setAuthMode = () => {
            if (!isAuthModeOn && obj.brand !== 'Huawei') {
              return {
                label: '关闭免密访问',
                action: () => {
                  this.createDialog('RedisUpdateAuthModeDialog', {
                    title: '关闭免密访问',
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.elasticcaches'),
                  })
                },
                meta: () => {
                  return {
                    validate: isRunning,
                    tooltip: notRunninTip,
                  }
                },
              }
            }
            return {
              label: '开启免密访问',
              action: () => {
                this.createDialog('RedisUpdateAuthModeDialog', {
                  title: '开启免密访问',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.elasticcaches'),
                })
              },
              meta: () => {
                return {
                  validate: isRunning && obj.brand !== 'Huawei',
                  tooltip: notRunninTip || (obj.brand === 'Huawei' && '华为云暂不支持此操作'),
                }
              },
            }
          }
          return [
            {
              label: '重启',
              action: () => {
                this.createDialog('RedisRestartdialog', {
                  title: '重启',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.elasticcaches'),
                })
              },
              meta: () => {
                return {
                  validate: isRunning,
                  tooltip: notRunninTip,
                }
              },
            },
            {
              label: '调整配置',
              action: () => {
                this.createDialog('RedisSetConfigDialog', {
                  title: '调整配置',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.elasticcaches'),
                })
              },
              meta: () => {
                const isPrepaid = obj.billing_type === 'prepaid'
                return {
                  validate: isRunning && !isPrepaid,
                  tooltip: notRunninTip || (isPrepaid ? '仅包年包月的实例，暂不支持此操作' : ''),
                }
              },
            },
            {
              label: '清空数据',
              action: () => {
                this.createDialog('RedisClearDataDialog', {
                  title: '清空数据',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.elasticcaches'),
                })
              },
              meta: () => {
                return {
                  validate: isRunning,
                  tooltip: notRunninTip,
                }
              },
            },
            {
              label: provider === 'Huawei' ? '修改密码' : '重置密码',
              action: () => {
                this.createDialog('RedisResetPassworddialog', {
                  title: provider === 'Huawei' ? '修改密码' : '重置密码',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.elasticcaches'),
                })
              },
              meta: () => {
                return {
                  validate: isRunning,
                  tooltip: notRunninTip,
                }
              },
            },
            {
              label: `更改${this.$t('dictionary.project')}`,
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  title: `更改${this.$t('dictionary.project')}`,
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.elasticcaches'),
                  resource: 'elasticcaches',
                })
              },
            },
            setAuthMode(),
            {
              label: '到期释放',
              action: () => {
                this.createDialog('SetDurationDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                if (obj.billing_type === 'prepaid') {
                  ret.tooltip = '包年包月机器，不支持此操作'
                  return ret
                }
                ret.validate = true
                return ret
              },
            },
            disableDeleteAction(this, {
              name: this.$t('dictionary.elasticcaches'),
            }),
            {
              label: '删除',
              permission: 'redis_elasticcaches_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: '删除',
                  name: this.$t('dictionary.elasticcaches'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                let tooltip = ''
                let seconds = this.$moment(obj.expired_at).diff(new Date()) / 1000
                if (obj.disable_delete) {
                  tooltip = '删除保护，如需解除，请点击【设置删除保护】'
                } else if (obj.billing_type === 'prepaid' && seconds > 0) {
                  tooltip = '实例未到期不允许删除'
                }
                return {
                  validate: !tooltip,
                  tooltip: tooltip,
                }
              },
            },
          ]
        },
      },
    ]
  },
}

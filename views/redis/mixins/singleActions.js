import { disableDeleteAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('db.text_69'),
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
        label: i18n.t('db.text_155'),
        actions: (obj) => {
          const { provider, status } = obj
          const isRunning = status.toLowerCase() === 'running'
          const notRunninTip = !isRunning ? i18n.t('db.text_156') : null
          const isAuthModeOn = obj.auth_mode === 'on'
          const setAuthMode = () => {
            if (!isAuthModeOn && obj.brand !== 'Huawei') {
              return {
                label: i18n.t('db.text_304'),
                action: () => {
                  this.createDialog('RedisUpdateAuthModeDialog', {
                    title: i18n.t('db.text_304'),
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    name: this.$t('dictionary.elasticcaches'),
                  })
                },
                meta: () => {
                  let validate = true
                  let tooltip = ''
                  if (!isRunning) {
                    validate = false
                    tooltip = notRunninTip
                  } else if (obj.brand === 'Qcloud' && obj.network_type !== 'vpc') {
                    validate = false
                    tooltip = i18n.t('db.text_354')
                  }
                  return {
                    validate,
                    tooltip,
                  }
                },
              }
            }
            return {
              label: i18n.t('db.text_305'),
              action: () => {
                this.createDialog('RedisUpdateAuthModeDialog', {
                  title: i18n.t('db.text_305'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.elasticcaches'),
                })
              },
              meta: () => {
                let validate = true
                let tooltip = ''
                if (!isRunning) {
                  validate = false
                  tooltip = notRunninTip
                } else if (obj.brand === 'Huawei') {
                  validate = false
                  tooltip = i18n.t('db.text_306')
                } else if (obj.brand === 'Qcloud' && obj.network_type !== 'vpc') {
                  validate = false
                  tooltip = i18n.t('db.text_354')
                }
                return {
                  validate,
                  tooltip,
                }
              },
            }
          }
          return [
            {
              label: i18n.t('db.text_70'),
              action: () => {
                this.createDialog('RedisRestartdialog', {
                  title: i18n.t('db.text_70'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.elasticcaches'),
                })
              },
              meta: () => {
                return {
                  validate: isRunning && obj.brand !== 'Qcloud',
                  tooltip: notRunninTip || (obj.brand === 'Qcloud' ? i18n.t('db.text_358') : ''),
                }
              },
            },
            {
              label: i18n.t('db.text_159'),
              action: () => {
                this.createDialog('RedisSetConfigDialog', {
                  title: i18n.t('db.text_159'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.elasticcaches'),
                })
              },
              meta: () => {
                const isPrepaid = obj.billing_type === 'prepaid'
                // 腾讯云暂不支持调整配置
                const isQcloud = obj.brand.toLowerCase() === 'qcloud'
                return {
                  validate: isRunning && !isPrepaid && !isQcloud,
                  tooltip: notRunninTip || (isPrepaid ? i18n.t('db.text_307') : '') || (isQcloud ? i18n.t('db.text_352') : ''),
                }
              },
            },
            {
              label: i18n.t('db.text_239'),
              action: () => {
                this.createDialog('RedisClearDataDialog', {
                  title: i18n.t('db.text_239'),
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
              label: provider === 'Huawei' ? i18n.t('db.text_308') : i18n.t('db.text_201'),
              action: () => {
                this.createDialog('RedisResetPassworddialog', {
                  title: provider === 'Huawei' ? i18n.t('db.text_308') : i18n.t('db.text_201'),
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
              label: i18n.t('db.text_160', [i18n.t('dictionary.project')]),
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  title: i18n.t('db.text_160', [i18n.t('dictionary.project')]),
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
              label: i18n.t('db.text_71'),
              action: () => {
                this.createDialog('SetDurationDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.elasticcaches'),
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                if (obj.billing_type === 'prepaid') {
                  ret.tooltip = i18n.t('db.text_72')
                  return ret
                }
                ret.validate = true
                return ret
              },
            },
            {
              label: i18n.t('db.text_157'),
              action: () => {
                this.createDialog('RedisRenewDialog', {
                  title: i18n.t('db.text_157'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const isPrepaid = obj.billing_type === 'prepaid'
                const validate = (isRunning && isPrepaid)
                return {
                  validate: validate,
                  tooltip: notRunninTip || (!isPrepaid ? i18n.t('db.text_158') : null),
                }
              },
            },
            {
              label: i18n.t('db.text_351'),
              action: () => {
                this.createDialog('AutoRenewDialog', {
                  name: i18n.t('dictionary.elasticcaches'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const isPrepaid = obj.billing_type === 'prepaid'
                const validate = (isRunning && isPrepaid)
                return {
                  validate: validate,
                  tooltip: notRunninTip || (!isPrepaid ? i18n.t('db.text_158') : null),
                }
              },
            },
            disableDeleteAction(this, {
              name: this.$t('dictionary.elasticcaches'),
            }),
            {
              label: i18n.t('db.text_42'),
              permission: 'redis_elasticcaches_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('db.text_42'),
                  name: this.$t('dictionary.elasticcaches'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}

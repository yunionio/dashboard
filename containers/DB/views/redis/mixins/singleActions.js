import { disableDeleteAction } from '@/utils/common/tableActions'
import { checkSecgroup } from '@DB/views/utils'
import { HYPERVISORS_MAP } from '@/constants'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('db.text_69'),
        permission: 'redis_elasticcaches_perform_sync',
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
                permission: 'redis_elasticcaches_perform_reset_password',
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
                  } else if ((obj.brand === HYPERVISORS_MAP.aws.brand || obj.brand === HYPERVISORS_MAP.azure.brand) && validate) {
                    validate = false
                    tooltip = i18n.t('db.text_384', [obj.brand])
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
              permission: 'redis_elasticcaches_perform_update_auth_mode',
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
                } else if ((obj.brand === HYPERVISORS_MAP.aws.brand || obj.brand === HYPERVISORS_MAP.azure.brand) && validate) {
                  validate = false
                  tooltip = i18n.t('db.text_384', [obj.brand])
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
              permission: 'redis_elasticcaches_perform_restart',
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
                const ret = {
                  validate: isRunning && obj.brand !== 'Qcloud',
                  tooltip: notRunninTip || (obj.brand === 'Qcloud' ? i18n.t('db.text_358') : ''),
                }
                // aws 和 azure禁用
                if ((obj.brand === HYPERVISORS_MAP.aws.brand || obj.brand === HYPERVISORS_MAP.azure.brand) && ret.validate) {
                  ret.validate = false
                  ret.tooltip = this.$t('db.text_384', [obj.brand])
                }
                return ret
              },
            },
            {
              label: i18n.t('db.text_159'),
              permission: 'redis_elasticcaches_perform_change_spec',
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
                const ret = {
                  validate: isRunning && !isPrepaid && !isQcloud,
                  tooltip: notRunninTip || (isPrepaid ? i18n.t('db.text_307') : '') || (isQcloud ? i18n.t('db.text_352') : ''),
                }
                // aws 和 azure禁用
                if ((obj.brand === HYPERVISORS_MAP.aws.brand || obj.brand === HYPERVISORS_MAP.azure.brand) && ret.validate) {
                  ret.validate = false
                  ret.tooltip = this.$t('db.text_384', [obj.brand])
                }
                return ret
              },
            },
            {
              label: i18n.t('db.text_239'),
              permission: 'redis_elasticcaches_perform_flush_instance',
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
                const ret = {
                  validate: isRunning,
                  tooltip: notRunninTip,
                }
                // aws 和 azure禁用
                if ((obj.brand === HYPERVISORS_MAP.aws.brand || obj.brand === HYPERVISORS_MAP.azure.brand) && ret.validate) {
                  ret.validate = false
                  ret.tooltip = this.$t('db.text_384', [obj.brand])
                }
                return ret
              },
            },
            {
              label: provider === 'Huawei' ? i18n.t('db.text_308') : i18n.t('db.text_201'),
              permission: 'redis_elasticcaches_perform_reset_password',
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
                const ret = {
                  validate: isRunning,
                  tooltip: notRunninTip,
                }
                // aws 和 azure禁用
                if ((obj.brand === HYPERVISORS_MAP.aws.brand || obj.brand === HYPERVISORS_MAP.azure.brand) && ret.validate) {
                  ret.validate = false
                  ret.tooltip = this.$t('db.text_384', [obj.brand])
                }
                return ret
              },
            },
            {
              label: i18n.t('db.text_160', [i18n.t('dictionary.project')]),
              permission: 'redis_elasticcaches_perform_change_owner',
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
            {
              label: this.$t('compute.text_1116'),
              permission: 'server_perform_add_secgroup',
              action: () => {
                this.createDialog('SetSecgroupDialog', {
                  vm: this,
                  data: [obj],
                  name: this.$t('dictionary.elasticcache'),
                  resource: 'elasticcache_id',
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const ret = checkSecgroup(obj, 'redis', ['Qcloud'])
                // aws 和 azure禁用
                if ((obj.brand === HYPERVISORS_MAP.aws.brand || obj.brand === HYPERVISORS_MAP.azure.brand) && ret.validate) {
                  ret.validate = false
                  ret.tooltip = this.$t('db.text_384', [obj.brand])
                }
                return ret
              },
            },
            setAuthMode(),
            {
              label: i18n.t('db.text_71'),
              permission: 'redis_elasticcaches_perform_postpaid_expire',
              action: () => {
                this.createDialog('SetDurationDialog', {
                  data: [obj],
                  columns: this.columns,
                  alert: this.$t('db.text_393'),
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
              permission: 'redis_elasticcaches_perform_renew',
              action: () => {
                this.createDialog('RedisRenewDialog', {
                  title: i18n.t('db.text_157'),
                  name: this.$t('dictionary.elasticcaches'),
                  data: [obj],
                  alert: this.$t('network.text_765'),
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
              permission: 'redis_elasticcaches_perform_set_auto_renew',
              action: () => {
                this.createDialog('AutoRenewDialog', {
                  name: i18n.t('dictionary.elasticcaches'),
                  data: [obj],
                  alert: this.$t('network.text_766'),
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
            disableDeleteAction(Object.assign(this, { permission: 'redis_elasticcaches_update' }), {
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

import { disableDeleteAction } from '@/utils/common/tableActions'
import { checkSecgroup } from '@DB/views/utils'
import { HYPERVISORS_MAP } from '@/constants'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('db.text_69'),
        permission: 'rds_dbinstances_perform_syncstatus',
        action: (obj) => {
          this.onManager('performAction', {
            steadyStatus: 'running',
            id: obj.id,
            managerArgs: {
              action: 'sync-status',
            },
          }).then(ret => {
            if (ret.status === 200) {
              this.$message.success(i18n.t('db.text_149'))
            }
          })
        },
      },
      {
        label: i18n.t('db.text_155'),
        actions: (obj) => {
          const isRunning = obj.status.toLowerCase() === 'running'
          const notRunninTip = !isRunning ? i18n.t('db.text_156') : null
          return [
            {
              label: i18n.t('db.text_70'),
              permission: 'rds_dbinstances_perform_reboot',
              action: () => {
                this.createDialog('RDSRestartdialog', {
                  title: i18n.t('db.text_70'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
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
              label: i18n.t('db.text_159'),
              permission: 'rds_dbinstances_perform_change_config',
              action: () => {
                this.createDialog('RSDSetConfig', {
                  title: i18n.t('db.text_159'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
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
              label: this.$t('compute.text_1116'),
              permission: 'server_perform_add_secgroup',
              action: () => {
                this.createDialog('SetSecgroupDialog', {
                  vm: this,
                  data: [obj],
                  name: this.$t('dictionary.dbinstances'),
                  resource: 'dbinstances_id',
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const ret = checkSecgroup(obj, 'rds')
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
              permission: 'rds_dbinstances_perform_change_owner',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  title: i18n.t('db.text_160', [i18n.t('dictionary.project')]),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.dbinstances'),
                  resource: 'dbinstances',
                })
              },
            },
            {
              label: i18n.t('db.text_71'),
              permission: 'rds_dbinstances_perform_postpaid_expire',
              action: () => {
                this.createDialog('SetDurationDialog', {
                  data: [obj],
                  columns: this.columns,
                  alert: this.$t('db.text_391'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.dbinstances'),
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
              permission: 'rds_dbinstances_perform_renew',
              action: () => {
                this.createDialog('RedisRenewDialog', {
                  title: i18n.t('db.text_157'),
                  name: i18n.t('dictionary.dbinstances'),
                  alert: this.$t('network.text_765'),
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
                if (obj.billing_type !== 'prepaid') {
                  ret.tooltip = i18n.t('db.text_158')
                  return ret
                }
                ret.validate = true
                return ret
              },
            },
            {
              label: i18n.t('db.text_351'),
              permission: 'rds_dbinstances_perform_set_auto_renew',
              action: () => {
                this.createDialog('AutoRenewDialog', {
                  name: i18n.t('dictionary.dbinstances'),
                  data: [obj],
                  alert: this.$t('network.text_766'),
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
                if (obj.billing_type !== 'prepaid') {
                  ret.tooltip = i18n.t('db.text_158')
                  return ret
                }
                ret.validate = true
                return ret
              },
            },
            disableDeleteAction(Object.assign(this, { permission: 'rds_dbinstances_update' }), {
              name: this.$t('dictionary.dbinstances'),
            }),
            {
              label: i18n.t('db.text_42'),
              permission: 'rds_dbinstances_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('db.text_42'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('dictionary.dbinstances'),
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

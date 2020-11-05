import { disableDeleteAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('db.text_69'),
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
                return {
                  validate: isRunning,
                  tooltip: notRunninTip,
                }
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
                  name: i18n.t('dictionary.dbinstances'),
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
              label: i18n.t('db.text_159'),
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
                  name: this.$t('dictionary.dbinstances'),
                  resource: 'dbinstances',
                })
              },
            },
            {
              label: i18n.t('db.text_71'),
              action: () => {
                this.createDialog('SetDurationDialog', {
                  data: [obj],
                  columns: this.columns,
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
              action: () => {
                this.createDialog('RdsRenewDialog', {
                  title: i18n.t('db.text_157'),
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
              action: () => {
                this.createDialog('AutoRenewDialog', {
                  name: i18n.t('dictionary.dbinstances'),
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
            disableDeleteAction(this, {
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

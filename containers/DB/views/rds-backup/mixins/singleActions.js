import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('db.text_45'),
        permission: 'rds_dbinstances_perform_recovery',
        action: (obj) => {
          this.createDialog('RDSBackupRecovery', {
            title: i18n.t('db.text_45'),
            data: [obj],
            rdsItem: this.data,
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            success: () => {
              this.destroySidePages()
            },
          })
        },
        meta: (obj) => {
          let validate = true
          let tooltip = ''
          if (obj.status !== 'ready') {
            validate = false
            tooltip = i18n.t('db.text_224')
          }
          if (obj.provider === 'Qcloud') {
            validate = false
            tooltip = this.$t('db.text_343')
          }
          if (obj.provider === 'Aliyun' && (obj.backup_method === 'Logical' || obj.backup_method === 'Snapshot')) {
            validate = false
            tooltip = i18n.t('db.text_375')
          }
          return {
            validate: validate,
            tooltip: tooltip,
          }
        },
      },
      {
        label: i18n.t('db.text_69'),
        permission: 'rds_dbinstancebackups_perform_syncstatus',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: () => ({
          validate: true,
        }),
      },
      {
        label: i18n.t('db.text_42'),
        permission: 'rds_dbinstancebackups_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            title: i18n.t('db.text_42'),
            name: i18n.t('db.text_44'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          if (obj.brand === 'Aliyun') {
            return {
              validate: false,
              tooltip: i18n.t('db.text_214'),
            }
          }
          return {
            validate: true,
          }
        },
      },
    ]
  },
}

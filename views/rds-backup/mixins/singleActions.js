import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('db.text_45'),
        action: (obj) => {
          this.createDialog('RDSBackupRecovery', {
            title: i18n.t('db.text_45'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          let validate = true
          let tooltip = ''
          if (obj.status !== 'ready') {
            validate = false
            tooltip = i18n.t('db.text_224')
          }
          if (this.data.provider === 'Qcloud' || this.data.provider === 'Aliyun') {
            validate = false
            tooltip = this.data.provider === 'Qcloud' ? this.$t('db.text_343') : this.$t('db.text_343')
          }
          return {
            validate: validate,
            tooltip: tooltip,
          }
        },
      },
      {
        label: i18n.t('db.text_69'),
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
        meta: () => {
          if (this.data.brand === 'Aliyun') {
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

import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.rollback_instance_backup'),
        permission: 'instancebackups_perform_recovery',
        action: obj => {
          this.createDialog('InstanceBackupRollbackDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          return { validate: true }
        },
      },
      {
        label: i18n.t('compute.perform_delete'),
        permission: 'instancebackups_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.perform_delete'),
            onManager: this.onManager,
            name: i18n.t('compute.text_462'),
          })
        },
        meta: obj => {
          return this.$getDeleteResult(obj)
        },
      },
    ]
  },
}

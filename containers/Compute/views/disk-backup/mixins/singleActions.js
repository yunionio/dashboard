import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.perform_sync_status'),
        permission: 'diskbackups_perform_syncstatus',
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
        label: i18n.t('compute.text_478'),
        permission: 'diskbackups_perform_recovery',
        action: obj => {
          this.createDialog('DiskBackupRollbackDialog', {
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
        permission: 'diskbackups_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.perform_delete'),
            onManager: this.onManager,
            name: i18n.t('compute.disk_backup'),
            content: () => {
              const change = (bool) => {
                this.deleteResProps.force = bool
              }
              return <a-checkbox onInput={ change }>{ this.$t('compute.text_655') }</a-checkbox>
            },
            requestParams: this.deleteResProps,
          })
        },
        meta: obj => {
          return this.$getDeleteResult(obj)
        },
      },
    ]
  },
}

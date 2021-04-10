import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_477'),
        permission: 'disks_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.text_477'),
            name: this.$t('dictionary.disk'),
            requestParams: { override_pending_delete: true },
            onManager: this.onManager,
          })
        },
        meta: obj => {
          return {
            validate: obj.can_delete,
            tooltip: obj.can_delete ? '' : this.$t('compute.text_1344'),
          }
        },
      },
      {
        label: i18n.t('compute.text_478'),
        permission: 'disks_perform_cancel_delete',
        action: (obj) => {
          this.createDialog('DiskRestoreDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          return {
            validate: obj.status !== 'deleting',
          }
        },
      },
    ]
  },
}

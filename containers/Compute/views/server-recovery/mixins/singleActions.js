import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_477'),
        permission: 'server_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.text_477'),
            name: this.$t('dictionary.server'),
            requestParams: { override_pending_delete: true },
            onManager: this.onManager,
            success: () => {
              this.list.singleRefresh(obj.id, ['deleting'])
            },
          })
        },
      },
      {
        label: i18n.t('compute.text_478'),
        permission: 'server_perform_cancel_delete',
        action: (obj) => {
          this.createDialog('ServerRestoreDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
      },
    ]
  },
}

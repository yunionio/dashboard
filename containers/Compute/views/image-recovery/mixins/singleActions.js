import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_477'),
        permission: 'images_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.text_477'),
            name: this.cloudEnv === 'images' ? this.$t('dictionary.image') : this.$t('compute.text_98'),
            onManager: this.onManager,
            requestParams: { override_pending_delete: true },
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
      {
        label: i18n.t('compute.text_478'),
        permission: 'images_perform_cancel_delete',
        action: (obj) => {
          this.createDialog('ImageRestoreDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
            cloudEnv: this.cloudEnv,
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

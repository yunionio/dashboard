import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_1084'),
        action: obj => {
          this.createDialog('AttachDiskDialog', {
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.text_1084'),
            refresh: this.refresh,
          })
        },
        meta: obj => {
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('compute.perform_delete'),
        permission: 'snapshotpolicy_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.perform_delete'),
            name: this.$t('dictionary.snapshotpolicy'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}

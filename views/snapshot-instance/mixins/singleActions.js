import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_261'),
        permission: 'snapshots_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.text_261'),
            onManager: this.onManager,
            name: i18n.t('compute.text_462'),
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}

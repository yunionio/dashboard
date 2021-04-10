import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_1355'),
        action: obj => {
          this.createDialog('RollbackHostDialog', {
            vm: this,
            title: i18n.t('compute.text_1355'),
            name: i18n.t('compute.text_102'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: obj => ({
          validate: obj.guest_status === 'ready',
          tooltip: obj.guest_status === 'ready' ? '' : i18n.t('compute.text_1357'),
        }),
      },
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

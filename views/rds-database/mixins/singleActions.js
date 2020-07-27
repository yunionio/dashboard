import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('db.text_42'),
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('db.text_42'),
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
    ]
  },
}

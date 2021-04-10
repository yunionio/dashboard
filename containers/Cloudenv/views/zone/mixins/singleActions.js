import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_108'),
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            name: i18n.t('cloudenv.text_11'),
            title: i18n.t('cloudenv.text_108'),
            onManager: this.onManager,
            success: () => {
              this.destroySidePages()
            },
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}

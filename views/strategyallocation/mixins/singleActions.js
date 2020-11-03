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
            title: i18n.t('cloudenv.text_108'),
            name: this.$t('dictionary.strategyallocation'),
            onManager: this.onManager,
            success: () => {
              window.location.reload()
            },
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}

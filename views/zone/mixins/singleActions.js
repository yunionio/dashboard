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
            onManager: this.onManager,
            success: () => {
              this.destroySidePages()
            },
          })
        },
        meta: obj => {
          return {
            validate: obj.can_delete,
          }
        },
      },
    ]
  },
}

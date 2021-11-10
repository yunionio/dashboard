import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_666'),
        action: (obj) => {
          this.createDialog('ReservedIPFreedDialog', {
            title: i18n.t('network.text_666'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            name: i18n.t('network.text_651'),
            refresh: this.refresh,
            query: this.getParams,
          })
        },
        meta: (obj) => {
          let { validate, tooltip } = this.$getDeleteResult(obj)
          if (validate) {
            validate = this.isOwner(obj)
          }
          return {
            validate,
            tooltip,
          }
        },
      },
    ]
  },
}

import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('dialog.cancel'),
        permission: 'billtasks_perform_cancel',
        action: (obj) => {
          this.createDialog('BilltasksCancelDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          const ret = { validate: true }
          const canCancel = obj.status === 'init' || obj.status === 'queued'
          if (!canCancel) {
            ret.validate = false
            ret.tooltip = this.$t('cloudenv.billtask_cannot_cancel')
          }
          return ret
        },
      },
    ]
  },
}

import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('dialog.cancel'),
        permission: 'cloudaccountsynctasks_perform_cancel',
        action: (obj) => {
          this.createDialog('CloudaccountsynctasksCancelDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          const ret = { validate: true }
          const canCancel = ['queued', 'running'].includes(obj.status)
          if (!canCancel) {
            ret.validate = false
            ret.tooltip = this.$t('cloudenv.sync_task_cannot_cancel')
          }
          return ret
        },
      },
    ]
  },
}

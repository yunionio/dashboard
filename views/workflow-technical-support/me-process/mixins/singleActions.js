import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('common_356'),
        action: obj => {
          this.createDialog('WorkflowSupportEndDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            success: () => {
              this.refresh()
            },
          })
        },
      },
    ]
  },
}

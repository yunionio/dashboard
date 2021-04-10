import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('common_403'),
        action: obj => {
          this.createDialog('WorkflowRevokeDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            success: () => {
              this.refresh()
            },
          })
        },
        meta: (obj) => {
          return {
            validate: obj.state !== 'COMPLETED' && obj.state !== 'EXTERNALLY_TERMINATED' && obj.variables.can_terminate_status !== false,
          }
        },
      },
    ]
  },
}

export default {
  created () {
    this.singleActions = [
      {
        label: '撤销',
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
            validate: obj.state !== 'COMPLETED' && obj.state !== 'EXTERNALLY_TERMINATED',
          }
        },
      },
    ]
  },
}

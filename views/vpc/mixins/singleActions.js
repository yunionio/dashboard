export default {
  created () {
    this.singleActions = [
      {
        label: '同步状态',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: () => ({
          validate: true,
        }),
      },
      {
        label: '删除',
        permission: 'vpcs_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            title: '删除',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            success: () => {
              this.destroySidePages()
            },
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}

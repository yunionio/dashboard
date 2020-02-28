export default {
  created () {
    this.singleActions = [
      {
        label: '修改',
        permission: 'lb_loadbalanceracls_update',
        action: (obj) => {
          this.createDialog('LbaclsCreateDialog', {
            title: '修改',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            type: 'update',
          })
        },
      },
      {
        label: '删除',
        permission: 'lb_loadbalancerlisteners_delete',
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

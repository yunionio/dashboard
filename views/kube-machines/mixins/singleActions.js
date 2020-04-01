export default {
  created () {
    this.singleActions = [
      {
        label: '删除',
        permission: 'k8s_kubemachines_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            data: [obj],
            columns: this.columns,
            title: '删除',
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

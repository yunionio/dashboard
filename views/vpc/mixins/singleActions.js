export default {
  created () {
    this.singleActions = [
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

export default {
  created () {
    this.singleActions = [
      {
        label: '清除',
        permission: 'images_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '清除',
            name: '镜像',
            onManager: this.onManager,
            requestParams: { override_pending_delete: true },
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
      {
        label: '恢复',
        permission: 'images_perform_cancel_delete',
        action: (obj) => {
          this.createDialog('ImageRestoreDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          return {
            validate: obj.status !== 'deleting',
          }
        },
      },
    ]
  },
}

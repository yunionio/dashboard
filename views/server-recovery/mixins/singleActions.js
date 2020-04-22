export default {
  created () {
    this.singleActions = [
      {
        label: '清除',
        permission: 'server_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '清除',
            name: '主机',
            requestParams: { override_pending_delete: true },
            onManager: this.onManager,
          })
        },
      },
      {
        label: '恢复',
        permission: 'server_perform_cancel_delete',
        action: (obj) => {
          this.createDialog('ServerRestoreDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
      },
    ]
  },
}

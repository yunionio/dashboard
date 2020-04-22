export default {
  created () {
    this.singleActions = [
      {
        label: '清除',
        permission: 'disks_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '清除',
            name: '硬盘',
            requestParams: { override_pending_delete: true },
            onManager: this.onManager,
          })
        },
        meta: obj => {
          return {
            validate: obj.can_delete,
          }
        },
      },
      {
        label: '恢复',
        permission: 'disks_perform_cancel_delete',
        action: (obj) => {
          this.createDialog('DiskRestoreDialog', {
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

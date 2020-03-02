
export default {
  created () {
    this.singleActions = [
      {
        label: '恢复',
        action: (obj) => {
          this.createDialog('RDSBackupRecovery', {
            title: '恢复',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          return {
            validate: obj.status === 'ready',
            tooltip: obj.status !== 'ready' ? '正常状态下的备份，才可恢复' : '',
          }
        },
      },
      {
        label: '删除',
        action: (obj) => {
          this.createDialog('RDSBackupSidePage', {
            title: '删除',
            name: '备份',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
    ]
  },
}

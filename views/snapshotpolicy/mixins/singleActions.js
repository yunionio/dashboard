export default {
  created () {
    this.singleActions = [
      {
        label: '关联硬盘',
        action: obj => {
          this.createDialog('AttachDiskDialog', {
            data: [obj],
            columns: this.columns,
            title: '关联硬盘',
            refresh: this.refresh,
          })
        },
        meta: obj => {
          return {
            validate: true,
          }
        },
      },
      {
        label: '删除',
        permission: 'snapshotpolicy_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除',
            name: this.$t('dictionary.snapshotpolicy'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}

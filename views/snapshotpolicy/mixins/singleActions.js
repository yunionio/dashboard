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
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除',
            name: '自动快照策略',
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}

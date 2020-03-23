export default {
  created () {
    this.singleActions = [
      {
        label: '删除',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除',
            onManager: this.onManager,
            name: '快照',
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}

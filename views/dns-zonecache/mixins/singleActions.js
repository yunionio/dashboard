export default {
  created () {
    this.singleActions = [
      {
        label: '释放缓存',
        permission: 'dns_zonecaches_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '释放缓存',
            name: '缓存',
            onManager: this.onManager,
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}

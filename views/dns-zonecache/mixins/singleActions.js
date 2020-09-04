export default {
  created () {
    this.singleActions = [
      {
        label: '释放缓存',
        action: (obj) => {
          this.createDialog('DnsDeleteCacheDialog', {
            data: [obj],
            columns: this.columns,
            title: '释放缓存',
            resData: this.data,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          return this.$getDeleteResult(obj)
        },
      },
    ]
  },
}

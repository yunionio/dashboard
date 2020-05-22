export default {
  created () {
    this.singleActions = [
      {
        label: '释放',
        action: (obj) => {
          this.createDialog('ReservedIPFreedDialog', {
            title: '释放',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            name: '预留IP',
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

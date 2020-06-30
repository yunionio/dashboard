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
          let { validate, tooltip } = this.$getDeleteResult(obj)
          if (validate) {
            validate = this.isOwner(obj)
          }
          return {
            validate,
            tooltip,
          }
        },
      },
    ]
  },
}

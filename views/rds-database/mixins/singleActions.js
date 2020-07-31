
export default {
  created () {
    this.singleActions = [
      {
        label: '删除',
        permission: 'rds_dbinstancedatabases_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除',
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
    ]
  },
}

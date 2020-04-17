export default {
  created () {
    this.singleActions = [
      {
        label: '删除',
        permission: 'lb_loadbalancercertificates_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: '删除',
            name: '后端服务器组',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          if (!obj.can_delete) {
            return {
              validate: false,
              tooltip: '已关联监听，不可删除',
            }
          }
          return {
            validate: true,
            tooltip: '',
          }
        },
      },
    ]
  },
}

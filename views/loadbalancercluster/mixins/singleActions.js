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
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          if (!obj.can_delete) {
            return {
              validate: false,
              tooltip: '无法删除，请确保集群中的节点已被删除',
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

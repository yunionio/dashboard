export default {
  created () {
    this.singleActions = [
      {
        label: '删除',
        permission: 'lb_loadbalancercertificates_delete',
        action: (obj) => {
          this.createDialog('ClusterDeleteDialog', {
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
              tooltip: '请确认负载均衡实例已经迁移至其它集群',
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

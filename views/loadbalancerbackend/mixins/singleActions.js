export default {
  created () {
    this.singleActions = this.isListenerSidepage ? [] : [
      {
        label: '修改端口',
        permission: 'lb_loadbalancerbackends_update',
        action: (obj) => {
          this.createDialog('BackendUpdatePortDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
      },
      {
        label: '修改权重',
        permission: 'lb_loadbalancerbackends_update',
        action: (obj) => {
          this.createDialog('BackendUpdateWeightDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
      },
      {
        label: '删除',
        permission: 'lb_loadbalancerbackends_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: '删除',
            name: '后端服务器',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}

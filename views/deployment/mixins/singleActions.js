export default {
  created () {
    this.singleActions = [
      {
        label: '设置镜像/副本数',
        permission: 'k8s_depolyments_update',
        action: obj => {
          this.createDialog('K8SSetLimitDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
      {
        label: '查看/编辑',
        permission: 'k8s_depolyments_update',
        action: obj => {
          this.createDialog('K8SEditYamlDialog', {
            data: [obj],
            resource: '_raw/deployments',
            refresh: this.refresh,
          })
        },
      },
      {
        label: '删除',
        permission: 'k8s_depolyments_delete',
        action: (obj) => {
          const requestParams = {
            cluster: obj.clusterID,
          }
          if (obj.namespace) {
            requestParams.namespace = obj.namespace
          }
          this.createDialog('DeleteResDialog', {
            data: [obj],
            columns: this.columns,
            title: '删除',
            onManager: this.onManager,
            idKey: 'name',
            requestParams,
            success: () => {
              this.destroySidePages()
            },
          })
        },
      },
    ]
  },
}

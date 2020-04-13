export default {
  created () {
    this.singleActions = [
      {
        label: '设置镜像',
        permission: 'k8s_deployments_update',
        action: obj => {
          this.createDialog('K8SSetImageDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
      {
        label: '设置副本数',
        permission: 'k8s_deployments_update',
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
        label: '更多',
        actions: obj => [
          {
            label: '查看/编辑',
            permission: 'k8s_deployments_update',
            action: async () => {
              const manager = new this.$Manager(`_raw/${this.list.resource}`, 'v1')
              async function fetchData () {
                const { cluster, namespace } = obj
                const { data } = await manager.getSpecific({ id: obj.name, spec: 'yaml', params: { cluster, namespace } })
                return data
              }
              const configText = await fetchData()
              this.createDialog('K8SEditYamlDialog', {
                data: [obj],
                manager,
                refresh: this.refresh,
                configText,
              })
            },
          },
          {
            label: '删除',
            permission: 'k8s_deployments_delete',
            action: () => {
              const requestParams = {
                cluster: obj.clusterID,
              }
              if (obj.namespace) {
                requestParams.namespace = obj.namespace
              }
              this.createDialog('DeleteResDialog', {
                data: [obj],
                name: '无状态',
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
        ],
      },
    ]
  },
}

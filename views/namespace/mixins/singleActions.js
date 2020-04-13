export default {
  created () {
    this.singleActions = [
      {
        label: '删除',
        permission: 'k8s_namespaces_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除命名空间',
            name: '命名空间',
            onManager: this.onManager,
            requestData: {
              cluster: obj.clusterID,
            },
            requestParams: {
              id: obj.name,
            },
            success: () => {
              this.destroySidePages()
            },
          })
        },
      },
      {
        label: '查看/编辑',
        permission: 'k8s_namespaces_update',
        action: async obj => {
          const manager = new this.$Manager('_raw/namespaces', 'v1')
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
    ]
  },
}

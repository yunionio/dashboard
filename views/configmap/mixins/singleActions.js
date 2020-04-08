export default {
  created () {
    this.singleActions = [
      {
        label: '查看/编辑',
        permission: 'k8s_configmaps_update',
        action: async obj => {
          const manager = new this.$Manager('_raw/configmaps', 'v1')
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
        permission: 'k8s_configmaps_delete',
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
            name: '配置项',
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

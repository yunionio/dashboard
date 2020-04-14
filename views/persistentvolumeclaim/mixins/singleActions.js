export default {
  created () {
    this.singleActions = [
      {
        label: '查看/编辑',
        permission: 'k8s_persistentvolumeclaims_update',
        action: async obj => {
          const manager = new this.$Manager('persistentvolumeclaims', 'v1')
          async function fetchData () {
            const { cluster, namespace } = obj
            const { data } = await manager.getSpecific({ id: obj.name, spec: 'rawdata', params: { cluster, namespace } })
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
        permission: 'k8s_persistentvolumeclaims_delete',
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
            name: '存储声明',
            onManager: this.onManager,
            idKey: 'name',
            requestParams,
            success: () => {
              this.destroySidePages()
            },
          })
        },
        meta: (obj) => {
          let validate = true
          let tooltip = ''
          if (obj.mountedBy && obj.mountedBy.length > 0) {
            validate = false
            tooltip = '请选择【未被使用】的存储卷'
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

export default {
  created () {
    this.singleActions = [
      {
        label: '删除',
        permission: 'k8s_rbacrolebindings_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除角色',
            name: '角色',
            onManager: this.onManager,
            idKey: 'name',
            ok: (ids, data) => {
              return new this.$Manager(`${data[0]['type']}s`, 'v1').batchDelete({
                ids,
                data: {
                  cluster: data[0].clusterID,
                  namespace: data[0].namespace,
                },
              }).then(() => {
                if (this.getResponseData) {
                  this.getResponseData()
                } else {
                  this.destroySidePages()
                  this.refresh()
                }
                return true
              }).catch(error => {
                throw error
              })
            },
          })
        },
      },
      {
        label: '查看/编辑',
        permission: 'k8s_rbacrolebindings_update',
        action: async obj => {
          const manager = new this.$Manager('rbacrolebindings', 'v1')
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
            success: () => {
              if (this.getResponseData) this.getResponseData()
            },
          })
        },
      },
    ]
  },
}

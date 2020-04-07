export default {
  created () {
    this.singleActions = [
      {
        label: '设置为默认',
        permission: 'k8s_storageclasses_perform_set_default',
        action: obj => {
          new this.$Manager('storageclasses', 'v1').performAction({
            id: obj.name,
            action: 'set-default',
            data: { cluster: obj.cluster },
          }).then(() => {
            this.refresh()
          })
        },
      },
      {
        label: '删除',
        permission: 'k8s_storageclasses_update',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除存储类',
            name: '存储类',
            onManager: this.onManager,
            requestData: {
              cluster: obj.cluster,
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
        permission: 'k8s_storageclasses_update',
        action: async obj => {
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
    ]
  },
}

export default {
  created () {
    this.singleActions = [
      {
        label: '设置为可调度',
        permission: 'k8s_nodes_perform_uncordon',
        action: obj => {
          new this.$Manager('k8s_nodes', 'v1').performAction({
            id: obj.name,
            action: 'uncordon',
            data: { cluster: obj.cluster },
          }).then(() => {
            this.refresh()
          })
        },
        meta: obj => {
          return {
            validate: obj.unschedulable,
          }
        },
      },
      {
        label: '设置为不可调度',
        permission: 'k8s_nodes_perform_cordon',
        action: obj => {
          new this.$Manager('k8s_nodes', 'v1').performAction({
            id: obj.name,
            action: 'cordon',
            data: { cluster: obj.cluster },
          }).then(() => {
            this.refresh()
          })
        },
        meta: obj => {
          return {
            validate: !obj.unschedulable,
          }
        },
      },
      {
        label: '查看/编辑',
        permission: 'k8s_nodes_update',
        action: async obj => {
          const manager = new this.$Manager('_raw/k8s_nodes', 'v1')
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

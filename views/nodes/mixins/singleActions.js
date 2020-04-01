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
    ]
  },
}

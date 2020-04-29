export default {
  created () {
  },
  computed: {
    singleActions () {
      if (this.$store.getters.scope === 'project') {
        return [
          {
            label: '查看 kubeconfig',
            permission: 'k8s_kubeclusters_get_kubeconfig',
            action: obj => {
              this.createDialog('ClusterShowKubeConfigDialog', {
                data: [obj],
                onManager: this.onManager,
                refresh: this.refresh,
              })
            },
          },
        ]
      }
      return [
        {
          label: '查看 kubeconfig',
          permission: 'k8s_kubeclusters_get_kubeconfig',
          action: obj => {
            this.createDialog('ClusterShowKubeConfigDialog', {
              data: [obj],
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: '设置为私有',
                permission: 'k8s_kubeclusters_perform_private',
                action: () => {
                  this.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'private',
                    },
                  }).then(() => {
                    this.$message.success(`设置为私有仅当前${this.$t('dictionary.project')}可见`)
                  })
                },
                meta: (obj) => {
                  return {
                    validate: obj.is_public,
                  }
                },
              },
              {
                label: '设置为公有',
                permission: 'k8s_kubeclusters_perform_public',
                action: () => {
                  this.onManager('performAction', {
                    id: obj.id,
                    managerArgs: {
                      action: 'public',
                    },
                  }).then(() => {
                    this.$message.success(`设置为公有将全部${this.$t('dictionary.project')}可见`)
                  })
                },
                meta: (obj) => {
                  return {
                    validate: !obj.is_public,
                  }
                },
              },
              {
                label: '删除',
                permission: 'k8s_kubeclusters_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: [obj],
                    columns: this.columns,
                    title: '删除',
                    onManager: this.onManager,
                    success: () => {
                      this.destroySidePages()
                    },
                  })
                },
                meta: () => {
                  return this.$getDeleteResult(obj)
                },
              },
            ]
          },
        },
      ]
    },
  },
}

export default {
  created () {
    this.singleActions = [
      // {
      //   label: '升级',
      //   permission: 'k8s_releases_update',
      //   action: async obj => {
      //     this.$router.push({
      //       path: `/k8s-release/update/${obj.name}`,
      //       query: {
      //         cluster: obj.clusterID,
      //         namespace: obj.namespace,
      //         chart: obj.chart,
      //         repo: obj.repo_id,
      //       },
      //     })
      //   },
      // },
      // {
      //   label: '回滚',
      //   permission: 'k8s_releases_perform_rollback',
      //   action: async obj => {
      //     this.createDialog('K8SRollbackDialog', {
      //       data: [obj],
      //       columns: this.columns,
      //       onManager: this.onManager,
      //       cluster: obj.clusterID,
      //       namespace: obj.namespace,
      //     })
      //   },
      // },
      {
        label: '删除',
        permission: 'k8s_releases_delete',
        action: (obj) => {
          const requestParams = {
            cluster: obj.clusterID,
          }
          if (obj.namespace) {
            requestParams.namespace = obj.namespace
          }
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除',
            name: '发布',
            onManager: this.onManager,
            idKey: 'name',
            requestParams,
          })
        },
      },
    ]
  },
}

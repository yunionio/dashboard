export default {
  created () {
    this.singleActions = [
      {
        label: '设置镜像/副本数',
        permission: 'k8s_jobs_update',
        action: obj => {
          this.createDialog('K8SSetLimitDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            hideReplicas: true,
          })
        },
      },
      {
        label: '查看/编辑',
        permission: 'k8s_jobs_update',
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
      {
        label: '删除',
        permission: 'k8s_jobs_delete',
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
            name: '任务',
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

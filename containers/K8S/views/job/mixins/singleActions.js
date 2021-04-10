import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      // {
      //   label: '设置镜像',
      //   permission: 'k8s_jobs_update',
      //   action: obj => {
      //     this.createDialog('K8SSetImageDialog', {
      //       data: [obj],
      //       columns: this.columns,
      //       onManager: this.onManager,
      //       refresh: this.refresh,
      //     })
      //   },
      // },
      {
        label: i18n.t('k8s.text_215'),
        permission: 'k8s_jobs_update',
        action: async obj => {
          const manager = new this.$Manager('jobs', 'v1')
          async function fetchData () {
            const { cluster, namespace } = obj
            const { data } = await manager.getSpecific({ id: obj.id, spec: 'rawdata', params: { cluster, namespace } })
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
        label: i18n.t('k8s.text_201'),
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
            title: i18n.t('k8s.text_201'),
            name: i18n.t('k8s.text_7'),
            onManager: this.onManager,
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

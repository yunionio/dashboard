import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.text_215'),
        permission: 'k8s_cronjobs_update',
        action: async obj => {
          const manager = new this.$Manager('cronjobs', 'v1')
          async function fetchData () {
            const { data } = await manager.getSpecific({ id: obj.id, spec: 'rawdata' })
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
        permission: 'k8s_cronjobs_delete',
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
            name: i18n.t('k8s.text_8'),
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

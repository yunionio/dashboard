import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.text_215'),
        permission: 'k8s_vcjobs_update',
        action: async obj => {
          const manager = new this.$Manager('vcjobs', 'v1')
          const { data } = await manager.getSpecific({ id: obj.id, spec: 'rawdata' })
          this.createDialog('K8SEditYamlDialog', {
            data: [obj],
            manager,
            refresh: this.refresh,
            configText: data,
          })
        },
      },
      {
        label: i18n.t('k8s.text_201'),
        permission: 'k8s_vcjobs_delete',
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
            name: i18n.t('k8s.vc_job'),
            onManager: this.onManager,
            requestParams,
          })
        },
      },
    ]
  },
}

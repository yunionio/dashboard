import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.text_215'),
        permission: 'k8s_vchypernodes_update',
        action: async obj => {
          const manager = new this.$Manager('vchypernodes', 'v1')
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
        permission: 'k8s_vchypernodes_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            data: [obj],
            columns: this.columns,
            title: i18n.t('k8s.text_201'),
            name: i18n.t('k8s.vc_hypernode'),
            onManager: this.onManager,
            requestData: {
              cluster: obj.clusterID,
            },
          })
        },
      },
    ]
  },
}

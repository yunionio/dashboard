import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
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

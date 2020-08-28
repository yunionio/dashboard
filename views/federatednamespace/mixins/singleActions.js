import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.text_201'),
        permission: 'k8s_federatednamespaces_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('k8s.text_284'),
            name: i18n.t('k8s.text_23'),
            onManager: this.onManager,
            requestData: {
              cluster: obj.clusterID,
            },
            requestParams: {
              id: obj.name,
            },
            success: () => {
              this.destroySidePages()
            },
          })
        },
      },
    ]
  },
}

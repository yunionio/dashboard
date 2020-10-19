import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_130'),
        permission: 'lb_loadbalanceracls_update',
        action: (obj) => {
          this.createDialog('LbaclsCreateDialog', {
            title: i18n.t('network.text_130'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            type: 'update',
          })
        },
      },
      {
        label: i18n.t('network.text_131'),
        permission: 'lb_loadbalancerlisteners_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: i18n.t('network.text_131'),
            name: this.$t('network.text_142'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}

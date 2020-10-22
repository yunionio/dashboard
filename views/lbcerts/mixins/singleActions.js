import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_131'),
        permission: 'lb_loadbalancercertificates_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: i18n.t('network.text_131'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            name: this.$t('network.text_143'),
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}

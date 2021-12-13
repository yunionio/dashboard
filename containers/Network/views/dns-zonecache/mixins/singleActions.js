import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_131'),
        permission: 'dns_zonecaches_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('network.text_131'),
            name: i18n.t('common.text00107'),
            onManager: this.onManager,
            alert: this.$t('network.text_763'),
          })
        },
        meta: (obj) => {
          const ret = this.$isOwner(this.data)
          if (!ret.validate) return ret
          return this.$getDeleteResult(obj)
        },
      },
    ]
  },
}

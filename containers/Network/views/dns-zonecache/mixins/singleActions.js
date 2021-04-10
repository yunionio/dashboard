import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('storage.text_74'),
        permission: 'dns_zonecaches_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('storage.text_74'),
            name: i18n.t('common.text00107'),
            onManager: this.onManager,
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

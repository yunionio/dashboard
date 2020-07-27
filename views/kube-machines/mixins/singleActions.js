import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('k8s.text_201'),
        permission: 'k8s_kubemachines_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            data: [obj],
            columns: this.columns,
            title: i18n.t('k8s.text_201'),
            onManager: this.onManager,
            success: () => {
              this.destroySidePages()
            },
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
}

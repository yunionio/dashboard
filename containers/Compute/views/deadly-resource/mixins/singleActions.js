import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('common.more'),
        actions: obj => {
          return [
            {
              label: i18n.t('common.action.delete'),
              permission: 'billing_resource_checks_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  name: i18n.t('compute.deadly_resource'),
                  title: i18n.t('common.action.delete'),
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
            },
          ]
        },
      },
    ]
  },
}

import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_131'),
        permission: 'lb_loadbalancerclusters_delete',
        action: (obj) => {
          this.createDialog('ClusterDeleteDialog', {
            vm: this,
            title: i18n.t('network.text_131'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          if (!obj.can_delete) {
            return {
              validate: false,
              tooltip: i18n.t('network.text_359'),
            }
          }
          return {
            validate: true,
            tooltip: '',
          }
        },
      },
    ]
  },
}

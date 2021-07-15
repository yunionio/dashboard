import i18n from '@/locales'
import { PROVIDER_MAP } from '@/constants'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_131'),
        permission: 'lb_loadbalancerbackendgroups_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: i18n.t('network.text_131'),
            name: i18n.t('network.text_139'),
            data: [obj],
            columns: this.columns.slice(0, 2),
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          if (obj.provider.toLowerCase() === 'azure') {
            return {
              validate: false,
              tooltip: i18n.t('network.text_309', [PROVIDER_MAP[obj.provider].label]),
            }
          }

          if (!obj.can_delete) {
            return {
              validate: false,
              tooltip: i18n.t('network.text_356'),
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

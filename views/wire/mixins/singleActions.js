import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_606'),
        action: obj => {
          this.createDialog('WireUpdateDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
      {
        label: i18n.t('network.text_129'),
        actions: obj => {
          return [
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.wire'),
              resource: 'wires',
            }),
            getSetPublicAction(this, {
              name: this.$t('dictionary.wire'),
              scope: 'domain',
              resource: 'wires',
            }),
            {
              label: i18n.t('network.text_131'),
              permission: 'wires_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('network.text_131'),
                  name: this.$t('dictionary.hostwire'),
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}

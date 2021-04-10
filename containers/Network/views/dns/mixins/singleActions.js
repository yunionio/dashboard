import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_130'),
        action: (obj) => {
          this.createDialog('DnsCreateDialog', {
            title: i18n.t('network.text_130'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            type: 'update',
          })
        },
        meta: (obj) => ({
          validate: obj.can_update,
        }),
      },
      {
        label: i18n.t('network.text_129'),
        actions: obj => {
          return [
            ...getEnabledSwitchActions(this, obj),
            {
              label: i18n.t('network.text_155'),
              action: () => {
                this.createDialog('DnsCreateDialog', {
                  title: i18n.t('network.text_155'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  type: 'clone',
                })
              },
            },
            {
              label: i18n.t('network.text_131'),
              permission: 'dnsrecords_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('network.text_131'),
                  name: this.$t('dictionary.dnsrecord'),
                  data: [obj],
                  columns: this.columns,
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

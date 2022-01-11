import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('network.text_130'),
        permission: 'dns_recordsets_update',
        action: (obj) => {
          this.createDialog('DnsRecordSetCreateDialog', {
            title: this.$t('network.text_130'),
            data: [obj],
            detailData: this.data,
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
        label: this.$t('network.text_129'),
        actions: obj => {
          return [
            ...getEnabledSwitchActions(this, obj, ['dns_recordsets_enable', 'dns_recordsets_disable']),
            {
              label: this.$t('network.text_155'),
              permission: 'dns_recordsets_create',
              action: () => {
                this.createDialog('DnsRecordSetCreateDialog', {
                  title: this.$t('network.text_155'),
                  data: [obj],
                  detailData: this.data,
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  type: 'clone',
                })
              },
            },
            {
              label: this.$t('network.text_131'),
              permission: 'dns_recordsets_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: this.$t('network.text_131'),
                  name: i18n.t('common_663'),
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

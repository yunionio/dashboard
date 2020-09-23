import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.edit'),
        permission: 'commonalerts_update',
        action: obj => {
          this.$router.push({
            path: `commonalerts/${obj.id}/update`,
            query: {
              alertType: obj.alert_type,
            },
          })
        },
      },
      {
        label: this.$t('common.more'),
        actions: row => [
          ...getEnabledSwitchActions(this, row, ['commonalerts_perform_enable', 'commonalerts_perform_disable']),
          {
            label: this.$t('common.delete'),
            permission: 'commonalerts_delete',
            action: (obj) => {
              this.createDialog('DeleteResDialog', {
                vm: this,
                data: [obj],
                columns: this.columns,
                title: this.$t('common.delete'),
                name: this.$t('dictionary.commonalert'),
                onManager: this.onManager,
              })
            },
            meta: (obj) => this.$getDeleteResult(obj),
          },
        ],
      },
    ]
  },
}

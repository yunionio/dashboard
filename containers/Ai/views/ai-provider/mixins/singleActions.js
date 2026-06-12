import { getAiproxyRowEnabledActions } from '@Ai/utils/aiproxyEnabledActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.more'),
        actions: obj => [
          {
            label: this.$t('common.edit'),
            permission: 'ai_providers_update',
            action: () => {
              this.createDialog('AiProviderFormDialog', {
                type: 'edit',
                data: [obj],
                onManager: this.onManager,
                refresh: this.refresh,
              })
            },
          },
          ...getAiproxyRowEnabledActions(this, obj, 'ai_providers', this.$t('aice.aiproxy.provider')),
          {
            label: this.$t('table.action.delete'),
            permission: 'ai_providers_delete',
            action: () => {
              this.createDialog('DeleteResDialog', {
                vm: this,
                data: [obj],
                columns: this.columns,
                title: this.$t('table.action.delete'),
                name: this.$t('aice.aiproxy.provider'),
                onManager: this.onManager,
              })
            },
            meta: () => this.$getDeleteResult(obj),
          },
        ],
      },
    ]
  },
}

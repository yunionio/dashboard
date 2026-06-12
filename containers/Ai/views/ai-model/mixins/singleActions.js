import { getAiproxyRowEnabledActions } from '@Ai/utils/aiproxyEnabledActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.more'),
        actions: obj => [
          {
            label: this.$t('common.edit'),
            permission: 'ai_models_update',
            action: () => {
              this.createDialog('AiModelFormDialog', {
                type: 'edit',
                data: [obj],
                onManager: this.onManager,
                refresh: this.refresh,
              })
            },
          },
          ...getAiproxyRowEnabledActions(this, obj, 'ai_models', this.$t('aice.aiproxy.model')),
          {
            label: this.$t('table.action.delete'),
            permission: 'ai_models_delete',
            action: () => {
              this.createDialog('DeleteResDialog', {
                vm: this,
                data: [obj],
                columns: this.columns,
                title: this.$t('table.action.delete'),
                name: this.$t('aice.aiproxy.model'),
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

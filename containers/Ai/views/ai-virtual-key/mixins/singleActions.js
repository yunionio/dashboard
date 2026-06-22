import { getAiproxyRowEnabledActions } from '@Ai/utils/aiproxyEnabledActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.more'),
        actions: obj => [
          {
            label: this.$t('common.edit'),
            permission: 'ai_virtual_keys_update',
            action: () => {
              this.createDialog('AiVirtualKeyFormDialog', {
                type: 'edit',
                data: [obj],
                onManager: this.onManager,
                refresh: this.refresh,
              })
            },
          },
          ...getAiproxyRowEnabledActions(this, obj, 'ai_virtual_keys', this.$t('aice.aiproxy.virtual_key')),
          {
            label: this.$t('table.action.delete'),
            permission: 'ai_virtual_keys_delete',
            action: () => {
              this.createDialog('DeleteResDialog', {
                vm: this,
                data: [obj],
                columns: this.columns,
                title: this.$t('table.action.delete'),
                name: this.$t('aice.aiproxy.virtual_key'),
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

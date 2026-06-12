import { getSetPublicAction } from '@/utils/common/tableActions'
import { getAiproxyRowEnabledActions } from '@Ai/utils/aiproxyEnabledActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.more'),
        actions: obj => [
          {
            label: this.$t('common.edit'),
            permission: 'ai_routings_update',
            action: () => {
              this.createDialog('AiRoutingFormDialog', {
                type: 'edit',
                data: [obj],
                onManager: this.onManager,
                refresh: this.refresh,
              })
            },
          },
          {
            label: this.$t('aice.aiproxy.set_models'),
            permission: 'ai_routings_perform_set_models',
            action: () => {
              this.createDialog('AiRoutingSetModelsDialog', {
                data: [obj],
                onManager: this.onManager,
                refresh: this.refresh,
              })
            },
          },
          getSetPublicAction(this, {
            name: this.$t('aice.aiproxy.routing'),
            scope: 'project',
            resource: 'ai_routings',
          }, {
            permission: 'ai_routings_perform_public,ai_routings_perform_private',
          }),
          ...getAiproxyRowEnabledActions(this, obj, 'ai_routings', this.$t('aice.aiproxy.routing')),
          {
            label: this.$t('table.action.delete'),
            permission: 'ai_routings_delete',
            action: () => {
              this.createDialog('DeleteResDialog', {
                vm: this,
                data: [obj],
                columns: this.columns,
                title: this.$t('table.action.delete'),
                name: this.$t('aice.aiproxy.routing'),
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

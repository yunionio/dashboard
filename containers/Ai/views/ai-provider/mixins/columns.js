import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getLlmDeploymentLinkColumn, getLlmInstanceLinkColumn } from '@Ai/utils/aiproxyLlmLinkColumns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => (
          <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
        ),
      }),
      getEnabledTableColumn(),
      { field: 'provider_key', title: this.$t('aice.aiproxy.provider_key'), minWidth: 120 },
      {
        field: 'config.base_url',
        title: this.$t('aice.aiproxy.base_url'),
        minWidth: 180,
        formatter: ({ row }) => row.config?.base_url || '-',
      },
      getLlmDeploymentLinkColumn(this),
      getLlmInstanceLinkColumn(this),
      getTimeTableColumn(),
    ]
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AiProviderSidePage', {
        id: row.id,
        resource: 'ai_providers',
        getParams: this.getParam,
      }, { list: this.list })
    },
  },
}

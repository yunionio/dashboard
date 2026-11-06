import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getAiProviderLinkColumn } from '@Ai/utils/aiproxyLlmLinkColumns'

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
      getAiProviderLinkColumn(this),
      { field: 'model_key', title: this.$t('aice.aiproxy.model_key'), minWidth: 140 },
      {
        field: 'context_window',
        title: this.$t('aice.aiproxy.context_window'),
        minWidth: 120,
        formatter: ({ row }) => row.context_window || '-',
      },
      {
        field: 'input_modalities',
        title: this.$t('aice.aiproxy.capability_vision'),
        minWidth: 100,
        formatter: ({ row }) => (Array.isArray(row.input_modalities) && row.input_modalities.includes('image')
          ? this.$t('status.enabled.true')
          : this.$t('status.enabled.false')),
      },
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AiModelSidePage', {
        id: row.id,
        resource: 'ai_models',
        getParams: this.getParam,
      }, { list: this.list })
    },
  },
}

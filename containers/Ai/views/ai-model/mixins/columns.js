import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
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

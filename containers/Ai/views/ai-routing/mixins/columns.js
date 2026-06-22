import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getAiProxyNodeLinkColumn } from '@Ai/utils/aiproxyLlmLinkColumns'

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
      { field: 'model_key', title: this.$t('aice.aiproxy.model_key'), minWidth: 140 },
      { field: 'priority', title: this.$t('aice.aiproxy.priority'), width: 90 },
      getAiProxyNodeLinkColumn(this),
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AiRoutingSidePage', {
        id: row.id,
        resource: 'ai_routings',
        getParams: this.getParam,
      }, { list: this.list })
    },
  },
}

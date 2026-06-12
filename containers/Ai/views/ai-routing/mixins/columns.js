import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getLlmDeploymentLinkColumn } from '@Ai/utils/aiproxyLlmLinkColumns'

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
      { field: 'model_pattern', title: this.$t('aice.aiproxy.model_pattern'), minWidth: 140 },
      { field: 'priority', title: this.$t('aice.aiproxy.priority'), width: 90 },
      { field: 'ai_proxy_node_id', title: this.$t('aice.aiproxy.ai_proxy_node_id'), minWidth: 120 },
      getLlmDeploymentLinkColumn(this),
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

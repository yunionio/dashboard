import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getReplicasTableColumn,
  getBackendTableColumn,
  getLLMSkuTableColumn,
  getPlacementStrategyTableColumn,
  getAccessPolicyTableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'llmDeployment' }),
      getStatusTableColumn({
        field: 'aiproxy_sync_status',
        statusModule: 'llmDeploymentAiproxy',
        title: this.$t('aice.llm_deployment.aiproxy_sync_status'),
      }),
      getLLMSkuTableColumn({ vm: this }),
      getBackendTableColumn(),
      getReplicasTableColumn(),
      getPlacementStrategyTableColumn(),
      getAccessPolicyTableColumn(),
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
}

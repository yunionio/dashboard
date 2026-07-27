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
  // 调度/访问策略未实现，暂不展示
  // getPlacementStrategyTableColumn,
  // getAccessPolicyTableColumn,
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
      // 调度/访问策略未实现，暂不展示
      // getPlacementStrategyTableColumn(),
      // getAccessPolicyTableColumn(),
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
}

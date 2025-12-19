import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import {
  // getDeviceModelTableColumn,
  getImageTableColumn,
  getBandwidthTableColumn,
  getCpuTableColumn,
  getMemoryTableColumn,
  getDiskTableColumn,
  getLlmTypeTableColumn,
  getLlmModelNameTableColumn,
  getNetworkTableColumn,
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
      // getStatusTableColumn({ statusModule: 'phoneModel' }),
      // getDeviceModelTableColumn(),
      getStatusTableColumn({ statusModule: 'sku' }),
      getCpuTableColumn(),
      getMemoryTableColumn(),
      getDiskTableColumn(),
      getImageTableColumn(),
      getBandwidthTableColumn(),
      getLlmTypeTableColumn(),
      getLlmModelNameTableColumn(),
      getNetworkTableColumn(),
      getProjectTableColumn(),
      getPublicScopeTableColumn({
        vm: this,
        resource: 'llm_skus',
      }),
      getTimeTableColumn(),
    ]
  },
}

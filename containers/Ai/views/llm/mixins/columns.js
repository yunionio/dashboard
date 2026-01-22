import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getLlmIpColumn,
  getLlmSkuColumn,
  getLlmImageColumn,
  getCpuTableColumn,
  getMemoryTableColumn,
  getDiskTableColumn,
  getBandwidthTableColumn,
  getNetworkTypeTableColumn,
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
      getStatusTableColumn({ statusModule: 'server' }),
      getLlmIpColumn(),
      getLlmSkuColumn({ vm: this }),
      getLlmImageColumn({ vm: this }),
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'llms',
        columns: () => this.columns,
        tipName: this.$t('aice.llm'),
      }),
      getCpuTableColumn(),
      getMemoryTableColumn(),
      getDiskTableColumn(),
      getBandwidthTableColumn(),
      getNetworkTypeTableColumn(),
      getNetworkTableColumn(),
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
}

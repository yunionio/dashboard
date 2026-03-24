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
  getLlmTypeTableColumn,
  getCpuTableColumn,
  getMemoryTableColumn,
  getDiskTableColumn,
  getBandwidthTableColumn,
  getNetworkTypeTableColumn,
  getNetworkTableColumn,
} from '../utils/columns'

export default {
  computed: {
    isApplyType () {
      return this.$route.path.includes('app-llm')
    },
  },
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
      getStatusTableColumn({ field: 'llm_status', statusModule: 'container', title: this.$t('aice.container_status') }),
      getLlmIpColumn(),
      getLlmSkuColumn({ vm: this, isApplyType: this.isApplyType }),
      getLlmImageColumn({ vm: this }),
      getLlmTypeTableColumn(this.isApplyType),
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

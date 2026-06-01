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
  getAppNameTableColumn,
  getLlmTypeTableColumn,
  getCpuTableColumn,
  getMemoryTableColumn,
  getDiskTableColumn,
  getBandwidthTableColumn,
  getNetworkTypeTableColumn,
  getNetworkTableColumn,
} from '../utils/columns'
import { parseLlmRoute } from '@Ai/utils/llmRouteContext'

export default {
  computed: {
    llmRouteCtx () {
      return parseLlmRoute(this.$route.path)
    },
    isApplyType () {
      return this.llmRouteCtx.isApplyType
    },
    isDesktopType () {
      return this.llmRouteCtx.isDesktopType
    },
  },
  created () {
    const { isApplyType, isDesktopType } = parseLlmRoute(this.$route.path)
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
      getLlmSkuColumn({ vm: this, isApplyType, isDesktopType }),
      getLlmImageColumn({ vm: this }),
      ...(isDesktopType ? [getAppNameTableColumn()] : []),
      getLlmTypeTableColumn({ isApplyType, isDesktopType }),
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

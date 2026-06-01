import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import {
  // getDeviceModelTableColumn,
  getAppNameTableColumn,
  getImageTableColumn,
  getBandwidthTableColumn,
  getCpuTableColumn,
  getMemoryTableColumn,
  getDiskTableColumn,
  getLlmTypeTableColumn,
} from '../utils/columns'
import { parseLlmRoute } from '@Ai/utils/llmRouteContext'

export default {
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
      getStatusTableColumn({ statusModule: 'llmSku' }),
      getCpuTableColumn(),
      getMemoryTableColumn(),
      getDiskTableColumn(),
      getImageTableColumn({ vm: this }),
      ...(isDesktopType ? [getAppNameTableColumn()] : []),
      getBandwidthTableColumn(),
      getLlmTypeTableColumn({ isApplyType, isDesktopType }),
      getProjectTableColumn(),
      getPublicScopeTableColumn({
        vm: this,
        resource: 'llm_skus',
      }),
      getTimeTableColumn(),
    ]
  },
}

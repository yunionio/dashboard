import { parseLlmRoute } from '@Ai/utils/llmRouteContext'
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
  getLlmModelNameTableColumn,
} from '../utils/columns'

export default {
  created () {
    const { isApplyType, isDesktopType, isInferenceType } = parseLlmRoute(this.$route.path)
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
      ...(isInferenceType ? [getLlmModelNameTableColumn({ vm: this })] : []),
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

import { parseLlmRoute } from '@Ai/utils/llmRouteContext'
import i18n from '@/locales'
import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import LlmSkuImportStatus from '../components/LlmSkuImportStatus.vue'
import {
  getDeviceModelTableColumn,
  getVramClaimTableColumn,
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
      {
        field: 'status',
        title: i18n.t('common.status'),
        sortable: true,
        minWidth: 160,
        slots: {
          default: ({ row }) => {
            return [this.$createElement(LlmSkuImportStatus, { props: { row } })]
          },
        },
      },
      getCpuTableColumn(),
      getMemoryTableColumn(),
      getDiskTableColumn(),
      getImageTableColumn({ vm: this }),
      ...(isDesktopType ? [getAppNameTableColumn()] : []),
      ...(isInferenceType ? [getDeviceModelTableColumn(), getVramClaimTableColumn()] : []),
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

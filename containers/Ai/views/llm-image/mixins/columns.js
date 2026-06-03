import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getImageNameTableColumn,
  getImageLabelTableColumn,
  getAppNameTableColumn,
} from '../utils/columns'
import { parseLlmImageRoute } from '@Ai/utils/llmRouteContext'

export default {
  created () {
    const imageCtx = parseLlmImageRoute(this.$route.path)
    let llmTypeTitle = this.$t('aice.llm_type.llm')
    if (imageCtx.isDesktopImageRoute) {
      llmTypeTitle = this.$t('aice.llm_type')
    } else if (imageCtx.isAgentImageRoute) {
      llmTypeTitle = this.$t('aice.llm_type.app')
    }
    const columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getImageNameTableColumn(),
      getImageLabelTableColumn(),
      {
        field: 'llm_type',
        title: llmTypeTitle,
        width: 100,
        formatter: ({ row }) => {
          const key = row.llm_type ? `aice.llm_type.${row.llm_type.replace(/-/g, '_')}` : ''
          return key ? this.$t(key) : (row.llm_type || '-')
        },
      },
    ]
    if (imageCtx.isDesktopImageRoute) {
      columns.push(getAppNameTableColumn())
    }
    columns.push(
      getProjectTableColumn(),
      getPublicScopeTableColumn({
        vm: this,
        resource: 'llm_images',
      }),
      getTimeTableColumn(),
    )
    this.columns = columns
  },
}

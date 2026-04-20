import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getImageNameTableColumn,
  getImageLabelTableColumn,
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
      getImageNameTableColumn(),
      getImageLabelTableColumn(),
      {
        field: 'llm_type',
        title: this.$t('aice.llm_type.app'),
        width: 100,
        formatter: ({ row }) => {
          const key = row.llm_type ? `aice.llm_type.${row.llm_type.replace(/-/g, '_')}` : ''
          return key ? this.$t(key) : (row.llm_type || '-')
        },
      },
      getProjectTableColumn(),
      getPublicScopeTableColumn({
        vm: this,
        resource: 'llm_images',
      }),
      getTimeTableColumn(),
    ]
  },
}

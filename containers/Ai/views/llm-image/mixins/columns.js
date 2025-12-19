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
        field: 'credential_id',
        title: this.$t('aice.llm_image.credential'),
        slots: {
          default: ({ row }, h) => {
            if (row.credential_id) {
              return [
                <a-icon type="check-circle" style={{ color: '#1890ff' }} />,
              ]
            } else {
              return '-'
            }
          },
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

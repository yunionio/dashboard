import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import {
  getImageNameTableColumn,
  getImageLabelTableColumn,
  getRegistryTableColumn,
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
      getStatusTableColumn({ statusModule: 'containerImage' }),
      getImageNameTableColumn(),
      getImageLabelTableColumn(),
      getRegistryTableColumn({ vm: this }),
      getProjectTableColumn(),
      getPublicScopeTableColumn({
        vm: this,
        resource: 'container_images',
      }),
      getTimeTableColumn(),
    ]
  },
}

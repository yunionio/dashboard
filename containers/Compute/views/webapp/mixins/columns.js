import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getRegionTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import {
  getTypeTableColumn,
  getKindTableColumn,
  getTechStackTableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'webapp' }),
      getTypeTableColumn(),
      getKindTableColumn(),
      getTechStackTableColumn(),
      getBrandTableColumn(),
      getAccountTableColumn({ vm: this }),
      getRegionTableColumn(),
      getProjectTableColumn(),
    ]
  },
}

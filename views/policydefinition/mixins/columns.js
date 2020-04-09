import {
  getCategoryTableColumn,
  getConditionTableColumn,
  getParameterTableColumn,
} from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'policydefinition' }),
      getCategoryTableColumn(),
      getConditionTableColumn(),
      getParameterTableColumn(),
    ]
  },
}

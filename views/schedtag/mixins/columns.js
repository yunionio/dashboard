import {
  getDefaultStrategyTableColumn,
  getResourceTypeTableColumn,
  getResourceCountTableColumn,
  getDynamicSchedtagCountTableColumn,
  getSchedpolicyCountTableColumn,
} from '../utils/columns'
import {
  getNameDescriptionTableColumn,
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
      getDefaultStrategyTableColumn(),
      getResourceTypeTableColumn(),
      getResourceCountTableColumn(),
      getDynamicSchedtagCountTableColumn(),
      getSchedpolicyCountTableColumn(),
    ]
  },
}

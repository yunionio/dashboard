import { levelColumn, conditionColumn, strategyColumn } from '../utils'
import { getNameDescriptionTableColumn, getStatusTableColumn, getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: true,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'commonalert' }),
      getEnabledTableColumn(),
      strategyColumn,
      levelColumn,
      conditionColumn,
    ]
  },
}

import {
  getOperationColumns,
  getResourceTypeColumns,
  getResourceNumberColumns,
  getLabelTypeColumns,
  getTimerDescColumns,
} from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
  getProjectTableColumn,
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
      getStatusTableColumn({ statusModule: 'scheduledtask', minWidth: 90 }),
      getEnabledTableColumn({ minWidth: 90 }),
      getOperationColumns(),
      getResourceTypeColumns(),
      getResourceNumberColumns(this),
      getLabelTypeColumns(),
      getTimerDescColumns(),
      getTimeTableColumn(),
      getProjectTableColumn(),
    ]
  },
}

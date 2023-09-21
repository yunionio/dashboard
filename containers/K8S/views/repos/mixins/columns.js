import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getTypeTableColumn,
  getUrlTableColumn,
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
      getTypeTableColumn(),
      getStatusTableColumn({ statusModule: 'k8s_repo' }),
      getUrlTableColumn(),
      getTimeTableColumn(),
    ]
  },
}

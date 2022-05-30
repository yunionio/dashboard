import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
  getPublicScopeTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

import {
  getStorageTypeColumns,
  // getCapacityMbColumns,
  getProjectDomainTableColumns,
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
      getStatusTableColumn({ statusModule: 'backupStorage' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'backupstorages', columns: () => this.columns }),
      getStorageTypeColumns(),
      // getCapacityMbColumns(),
      getProjectDomainTableColumns(),
      getPublicScopeTableColumn({ vm: this, resource: 'backupstorages' }),
      getTimeTableColumn(),
    ]
  },
}

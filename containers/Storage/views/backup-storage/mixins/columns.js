import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
  getPublicScopeTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

import {
  getStorageTypeColumn,
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
      getStatusTableColumn({ statusModule: 'backupStorage', vm: this }),
      getTagTableColumn({ onManager: this.onManager, resource: 'backupstorages', columns: () => this.columns }),
      getStorageTypeColumn(),
      // getCapacityMbColumns(),
      getProjectDomainTableColumns(),
      getPublicScopeTableColumn({ vm: this, resource: 'backupstorages' }),
      getTimeTableColumn(),
    ]
  },
}

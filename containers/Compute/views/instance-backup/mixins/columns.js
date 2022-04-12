import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
  getTimeTableColumn,
  getProjectTableColumn,
  getBrandTableColumn,
  getOsArch,
} from '@/utils/common/tableColumn'

import {
  getBackupStorageNameTableColumn,
  getGuestTableColumn,
  getOsTypeTableColumn,
  getSizeMbTableColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addEncrypt: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'instanceBackup' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'instancebackups', columns: () => this.columns }),
      getBackupStorageNameTableColumn(),
      getSizeMbTableColumn(),
      getGuestTableColumn(),
      getOsArch(),
      getOsTypeTableColumn(),
      getBrandTableColumn(),
      getTimeTableColumn(),
      getProjectTableColumn(),
    ]
  },
}

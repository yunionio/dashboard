import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
  getTimeTableColumn,
  getProjectTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

import {
  getSizeMbTableColumn,
  getDiskTypeTableColumn,
  getDiskNameTableColumn,
  getDiskSizeTableColumn,
  getBackupStorageNameTableColumn,
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
      getStatusTableColumn({ statusModule: 'diskBackup' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'diskbackups', columns: () => this.columns }),
      getDiskTypeTableColumn(),
      getDiskNameTableColumn(),
      getDiskSizeTableColumn(),
      getBackupStorageNameTableColumn(),
      getSizeMbTableColumn(),
      getBrandTableColumn(),
      getTimeTableColumn(),
      getProjectTableColumn(),
    ]
  },
}

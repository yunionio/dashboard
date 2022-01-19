import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getRegionTableColumn,
  getProjectTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import {
<<<<<<< HEAD:containers/Compute/views/webapp/mixins/columns.js
  getTypeTableColumn,
  getKindTableColumn,
  getTechStackTableColumn,
=======
  getSizeMbTableColumn,
  getDiskTypeTableColumn,
  getDiskNameTableColumn,
  getDiskSizeTableColumn,
  getBackupStorageNameTableColumn,
>>>>>>> feat: add instance backup:containers/Compute/views/disk-backup/mixins/columns.js
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
<<<<<<< HEAD:containers/Compute/views/webapp/mixins/columns.js
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'webapp', tipName: this.$t('compute.webapp'), columns: () => this.columns }),
      getStatusTableColumn({ statusModule: 'webapp' }),
      getTypeTableColumn(),
      getKindTableColumn(),
      getTechStackTableColumn(),
=======
      getStatusTableColumn({ statusModule: 'diskBackup' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'diskbackups', columns: () => this.columns }),
      getDiskTypeTableColumn(),
      getDiskNameTableColumn(),
      getDiskSizeTableColumn(),
      getBackupStorageNameTableColumn(),
      getSizeMbTableColumn(),
>>>>>>> feat: add instance backup:containers/Compute/views/disk-backup/mixins/columns.js
      getBrandTableColumn(),
      getAccountTableColumn({ vm: this }),
      getRegionTableColumn(),
      getProjectTableColumn(),
    ]
  },
}

import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import {
  getDevTypeColumn,
  getModelColumn,
  getVendorIdColumn,
  getDeviceIdColumn,
} from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row, 'pci-detail') }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getDevTypeColumn(),
      getModelColumn(),
      getVendorIdColumn(),
      getDeviceIdColumn(),
    ]
  },
}

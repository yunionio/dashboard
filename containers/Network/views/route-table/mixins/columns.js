import {
  getRegionTableColumn,
  getAccountTableColumn,
  getProjectDomainTableColumn,
  getBrandTableColumn,
  getStatusTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import {
  getVpcTableColumn,
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
      getStatusTableColumn({ statusModule: 'routeTable' }),
      getVpcTableColumn(this),
      getBrandTableColumn({
        hidden: () => this.hiddenColumns.includes('brand'),
      }),
      getAccountTableColumn({
        hidden: () => this.hiddenColumns.includes('account'),
      }),
      getProjectDomainTableColumn(),
      getRegionTableColumn({
        hidden: () => this.hiddenColumns.includes('region'),
      }),
    ]
  },
}

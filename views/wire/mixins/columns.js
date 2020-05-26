import { getBandwidthTableColumn } from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getRegionTableColumn,
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

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
      getBandwidthTableColumn(),
      getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC', sortable: true }),
      {
        field: 'networks',
        title: '网络数量',
        width: 100,
        sortable: true,
      },
      getBrandTableColumn(),
      getPublicScopeTableColumn({ vm: this }),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
    ]
  },
}

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
  getTechStackTableColumn,
  getOsTypeTableColumn,
  getIpAddrTableColumn,
  getDomainTableColumn,
  getServerFarmTableColumn,
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
      getTagTableColumn({ onManager: this.onManager, resource: 'webapps', tipName: this.$t('compute.webapp'), columns: () => this.columns }),
      getStatusTableColumn({ statusModule: 'webapp', vm: this }),
      getTechStackTableColumn(),
      getOsTypeTableColumn(),
      getIpAddrTableColumn(),
      getDomainTableColumn(),
      getServerFarmTableColumn(),
      getBrandTableColumn(),
      getAccountTableColumn({ vm: this }),
      getRegionTableColumn(),
      getProjectTableColumn(),
    ]
  },
}

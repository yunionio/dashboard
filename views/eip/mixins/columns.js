import { getAssociateNameTableColumn } from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getProjectTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'

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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'server', columns: () => this.columns }),
      {
        field: 'ip_addr',
        title: '地址',
        width: 140,
      },
      getStatusTableColumn({ statusModule: 'eip' }),
      getAssociateNameTableColumn(),
      {
        field: 'bandwidth',
        title: '带宽',
        minWidth: 80,
        showOverflow: 'ellipsis',
        formatter: ({ cellValue }) => {
          return sizestr(cellValue, 'M', 1024)
        },
      },
      {
        field: 'charge_type',
        title: '计费方式',
        width: 80,
        formatter: ({ cellValue }) => {
          if (cellValue === 'traffic') {
            return '按流量计费'
          }
          if (cellValue === 'bandwidth') {
            return '按带宽计费'
          }
          return cellValue
        },
      },
      getBrandTableColumn(),
      getCopyWithContentTableColumn({
        field: 'account',
        title: '云账号',
      }),
      getProjectTableColumn(),
      getRegionTableColumn(),
    ]
  },
}

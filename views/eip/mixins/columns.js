import { getAssociateNameTableColumn } from '../utils/columns'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getProjectTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
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
      {
        field: 'ip_addr',
        title: '地址',
        width: 140,
      },
      {
        field: 'bandwidth',
        title: '带宽',
        minWidth: 80,
        showOverflow: 'ellipsis',
        formatter: ({ cellValue }) => {
          return sizestr(cellValue, 'M', 1024)
        },
      },
      getCopyWithContentTableColumn({
        field: 'account',
        title: '云账号',
      }),
      getRegionTableColumn(),
      getBrandTableColumn(),
      {
        field: 'charge_type',
        title: '计费方式',
        minWidth: 80,
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
      getStatusTableColumn({ statusModule: 'eip' }),
      getAssociateNameTableColumn(),
      getProjectTableColumn(),
    ]
  },
}

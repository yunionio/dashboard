import { BAND_WIDTH_OPTION } from '../../../constants'
import {
  getNameDescriptionTableColumn,
  getRegionTableColumn,
  getCopyWithContentTableColumn,
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
      {
        field: 'bandwidth',
        title: '带宽',
        minWidth: 100,
        sortable: true,
        showOverflow: 'ellipsis',
        formatter: ({ cellValue }) => {
          const item = BAND_WIDTH_OPTION.find(val => val.value === `${cellValue}`)
          return item ? item.label : cellValue
        },
      },
      getCopyWithContentTableColumn({ field: 'vpc', title: '专有网络', sortable: true }),
      {
        field: 'networks',
        title: '网络数量',
        width: 70,
        sortable: true,
      },
      getRegionTableColumn(),
    ]
  },
}

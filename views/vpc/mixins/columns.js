import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
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
      getCopyWithContentTableColumn({
        field: 'cidr_block',
        title: '目标网段',
        sortable: true,
      }),
      getRegionTableColumn(),
      getBrandTableColumn(),
      getAccountTableColumn(),
      getStatusTableColumn({ statusModule: 'vpc' }),
      {
        field: 'wire_count',
        title: '二层网络',
        width: 70,
        sortable: true,
      },
      {
        field: 'network_count',
        title: 'IP子网数量',
        width: 80,
        sortable: true,
      },
    ]
  },
}

import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
  getTimeTableColumn,
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
      getEnabledTableColumn(),
      {
        field: 'force_dispersion',
        title: '策略',
        width: 70,
        formatter: ({ cellValue }) => {
          let ret = '非强制'
          if (cellValue) ret = '强制'
          return ret
        },
      },
      getStatusTableColumn({ statusModule: 'instanceGroup' }),
      {
        field: 'granularity',
        title: '粒度',
        width: 70,
      },
      {
        field: 'guest_count',
        title: '绑定主机数量',
        width: 120,
        formatter: ({ cellValue }) => `${cellValue || 0}`,
      },
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
}

import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

const NatSpec = {
  'small': '小型',
  'medium': '中型',
  'large': '大型',
  'x-large': '超大型',
}
const BillingType = {
  'postpaid': '后付费',
  'prepaid': '预付费',
}

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
        field: 'nat_spec',
        title: '型号',
        formatter: ({ cellValue }) => {
          const spec = cellValue && cellValue.toLowerCase()
          return NatSpec[spec] || spec
        },
      },
      getCopyWithContentTableColumn({ field: 'vpc', title: '所属专有网络' }),
      getBrandTableColumn(),
      {
        field: 'region',
        title: '区域',
        width: 150,
      },
      getStatusTableColumn({ statusModule: 'nat' }),
      getAccountTableColumn(),
      {
        field: 'billing_type',
        title: '付费类型',
        formatter: ({ cellValue }) => {
          return BillingType[cellValue]
        },
      },
      getTimeTableColumn(),
    ]
  },
}

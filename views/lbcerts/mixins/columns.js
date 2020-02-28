import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: '证书名称',
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'common_name',
        title: '证书域名',
        width: 150,
        formatter: ({ cellValue }) => {
          return cellValue || '-'
        },
      },
      {
        field: 'not_after',
        title: '过期时间',
        width: 150,
        formatter: ({ cellValue }) => {
          return cellValue ? this.$moment(cellValue).format('YYYY年MM月DD日 HH:mm:ss') : '-'
        },
      },
      {
        field: 'subject_alternative_names',
        title: '关联扩展域名',
        width: 150,
        formatter: ({ cellValue }) => {
          return cellValue || '-'
        },
      },
      getProjectTableColumn(),
    ]
  },
}

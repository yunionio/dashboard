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
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getProjectTableColumn(),
      {
        field: 'created_at',
        title: '创建时间',
        formatter: ({ cellValue }) => {
          return this.$moment(cellValue).format()
        },
      },
    ]
  },
}

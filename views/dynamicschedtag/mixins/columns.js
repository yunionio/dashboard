import { getNameDescriptionTableColumn, getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        vm: this,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn(),
      getCopyWithContentTableColumn({
        field: 'schedtag',
        title: '调度标签',
      }),
      getCopyWithContentTableColumn({
        field: 'condition',
        title: '条件',
      }),
    ]
  },
}

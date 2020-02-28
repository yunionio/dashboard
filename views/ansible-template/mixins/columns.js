import { getEnabledTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn(),
      {
        filed: 'interval',
        title: '时间间隔',
        width: 100,
        slots: {
          default: ({ row: { interval } }) => {
            if (interval) {
              return `${(parseFloat(interval) / 60 / 60)}小时`
            }
            return '-'
          },
        },
      },
      getProjectTableColumn(),
      getTimeTableColumn(),
    ]
  },
}

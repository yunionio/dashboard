import { getEnabledTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

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
        title: i18n.t('compute.text_242'),
        width: 100,
        slots: {
          default: ({ row: { interval } }) => {
            if (interval) {
              return i18n.t('compute.text_258', [(parseFloat(interval) / 60 / 60)])
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

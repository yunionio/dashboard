import { STRATEGY_CN } from '@Cloudenv/constants/sched'
import { getNameDescriptionTableColumn, getEnabledTableColumn, getCopyWithContentTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn(),
      {
        field: 'strategy',
        title: i18n.t('cloudenv.text_413'),
        width: 80,
        formatter: ({ row }) => {
          return STRATEGY_CN[row.strategy] || i18n.t('cloudenv.text_4')
        },
      },
      getCopyWithContentTableColumn({
        field: 'schedtag',
        title: i18n.t('cloudenv.text_18'),
        hideField: true,
        slotCallback: (row) => {
          if (this.isPreLoad && !row.schedtag) return [<data-loading />]
          return row.schedtag
        },
      }),
      getCopyWithContentTableColumn({
        field: 'condition',
        title: i18n.t('cloudenv.text_22'),
      }),
      getTimeTableColumn(),
    ]
  },
}

import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import {
  getProcessDefinitionNameTableColumn,
  getPriorityTableColumn,
  getCommentTableColumn,
} from '../../utils/columns'
import { statusMap } from '../../constants'

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({
        field: 'id',
        title: i18n.t('common_350'),
        hideField: true,
        minWidth: 140,
        onManager: this.onManager,
        slotCallback: row => {
          return (
            <div>{ row.id }</div>
          )
        },
      }),
      getProcessDefinitionNameTableColumn(),
      getPriorityTableColumn(),
      {
        field: 'state',
        title: i18n.t('common_372'),
        minWidth: 80,
        showOverflow: 'title',
        slots: {
          default: ({ row }, h) => {
            const statusObj = statusMap[row.state]
            if (statusObj) {
              return [
                <span style={{ color: statusObj.color }}>{statusObj.text}</span>,
              ]
            }
          },
        },
      },
      getCommentTableColumn(),
      getTimeTableColumn({ field: 'start_time', title: i18n.t('common_374') }),
      getTimeTableColumn({ field: 'end_time', title: i18n.t('common_387') }),
    ]
  },
}

import {
  getProcessDefinitionNameTableColumn,
  getPriorityTableColumn,
  getCommentTableColumn,
} from '../../utils/columns'
import { statusMap } from '../../constants'
import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({
        field: 'id',
        title: i18n.t('common_350'),
        hideField: true,
        minWidth: 120,
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
      {
        field: 'assignee',
        title: i18n.t('common_399'),
        minWidth: 120,
        showOverflow: 'title',
        slots: {
          default: ({ row }) => {
            const assignees = []
            if (Array.isArray(row.tasks)) {
              row.tasks.forEach((item) => {
                if (!item.delete_reason) {
                  assignees.push(item.assignee_name)
                }
              })
            } else {
              if (row.tasks && !row.delete_reason) {
                assignees.push(row.tasks.assignee_name)
              }
            }
            return assignees.length > 0 ? assignees.join(',') : '-'
          },
        },
      },
      getCommentTableColumn(),
      getTimeTableColumn({ field: 'start_time', title: i18n.t('common_374') }),
      getTimeTableColumn({ field: 'end_time', title: i18n.t('common_387') }),
    ]
  },
}

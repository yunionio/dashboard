import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import {
  getProcessDefinitionNameTableColumn,
  internalResourceColumns,
} from '../../utils/columns'
import { statusMap } from '../../utils'

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({
        field: 'process_instance_id',
        title: i18n.t('common_350'),
        minWidth: 80,
        hideField: true,
        onManager: this.onManager,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.process_instance_id }</side-page-trigger>
          )
        },
      }),
      getProcessDefinitionNameTableColumn({ field: 'process_instance.process_definition_name' }),
      ...internalResourceColumns(),
      {
        field: 'initiator',
        title: i18n.t('common_371'),
        minWidth: 80,
        showOverflow: 'title',
        formatter: ({ cellVal, row }) => {
          return row.process_instance.start_user_displayname || row.process_instance.start_user_name
        },
      },
      {
        field: 'state',
        title: i18n.t('common_372'),
        minWidth: 80,
        showOverflow: 'title',
        formatter: ({ row }) => {
          const statusObj = statusMap(row.process_instance.process_definition_key)[row.process_instance.state]
          return statusObj ? statusObj.text : ''
        },
        slots: {
          default: ({ row }, h) => {
            const statusObj = statusMap(row.process_instance.process_definition_key)[row.process_instance.state]
            if (statusObj) {
              return [
                <span style={{ color: statusObj.color }}>{statusObj.text}</span>,
              ]
            }
          },
        },
      },
      {
        field: 'step',
        title: i18n.t('common_373'),
        minWidth: 80,
        showOverflow: 'title',
        formatter: ({ cellVal, row }) => {
          const tasks = row.process_instance.tasks || []
          const step = tasks[0]
          if (step) {
            return step.name
          }
          return ''
        },
      },
      getTimeTableColumn({ field: 'create_time', title: i18n.t('common_374') }),
    ]
  },
}

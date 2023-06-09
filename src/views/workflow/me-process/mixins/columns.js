import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import {
  getProcessDefinitionNameTableColumn,
  internalResourceColumns,
  getStateTableColumn,
  getAuditStatusTableColumn,
  getStatusTableColumn,
  getAssigneeTableColumn,
} from '../../utils/columns'

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({
        field: 'id',
        title: i18n.t('common_350'),
        hideField: true,
        minWidth: 80,
        onManager: this.onManager,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.id }</side-page-trigger>
          )
        },
      }),
      getProcessDefinitionNameTableColumn(),
      ...internalResourceColumns(),
      getStateTableColumn(),
      getAuditStatusTableColumn(),
      getStatusTableColumn(),
      getAssigneeTableColumn(),
      getTimeTableColumn({ field: 'start_time', title: i18n.t('common_374') }),
      getTimeTableColumn({ field: 'end_time', title: i18n.t('common_387') }),
    ]
  },
}

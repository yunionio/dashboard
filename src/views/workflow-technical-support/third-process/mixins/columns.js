import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getWorkflowType } from '@/constants/workflow'
import i18n from '@/locales'

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
            <div>{ row.id }</div>
          )
        },
      }),
      {
        field: 'process_definition_key',
        title: i18n.t('common_375'),
        minWidth: 80,
        showOverflow: 'title',
        slots: {
          default: ({ row }, h) => {
            const veriables = JSON.parse(row.variables || '{}')
            const objType = getWorkflowType(veriables.process_definition_key)
            return (objType && objType.name) || '-'
          },
        },
      },
      {
        field: 'variables.resource_project_name',
        title: this.$t('dictionary.project'),
        minWidth: 80,
        showOverflow: 'title',
        slots: {
          default: ({ row }, h) => {
            const veriables = JSON.parse(row.variables || '{}')
            return veriables.resource_project_name || '-'
          },
        },
      },
      {
        field: 'comment',
        title: this.$t('common_438'),
        minWidth: 80,
        showOverflow: 'title',
        slots: {
          default: ({ row }, h) => {
            const veriables = JSON.parse(row.variables || '{}')
            return veriables.comment || '-'
          },
        },
      },
      {
        field: 'status',
        title: i18n.t('common_372'),
        minWidth: 80,
        showOverflow: 'title',
        slots: {
          default: ({ row }, h) => {
            return row.status
          },
        },
      },
      getTimeTableColumn({ field: 'created_at', title: i18n.t('common_374') }),
      getTimeTableColumn({ field: 'end_at', title: i18n.t('common_387') }),
    ]
  },
}

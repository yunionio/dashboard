import {
  getProcessDefinitionNameTableColumn,
} from '../../utils/columns'
import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({
        field: 'id',
        title: '编号',
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
        field: 'status',
        title: '流程状态',
        minWidth: 80,
        showOverflow: 'title',
        slots: {
          default: ({ row }, h) => {
            return row.status
          },
        },
      },
      getTimeTableColumn({ field: 'created_at', title: '创建日期' }),
      getTimeTableColumn({ field: 'end_at', title: '结束日期' }),
    ]
  },
}

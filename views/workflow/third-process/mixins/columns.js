import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getWorkflowType } from '@/constants/workflow'

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
      {
        field: 'process_definition_key',
        title: '工单类型',
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

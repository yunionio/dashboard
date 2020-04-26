import {
  getProcessDefinitionNameTableColumn,
  getResourceNameTableColumn,
  getResourceProjectTableColumn,
} from '../../utils/columns'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
const R = require('ramda')

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({
        field: 'process_instance_id',
        title: '编号',
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
      getResourceNameTableColumn(),
      getResourceProjectTableColumn({
        field: 'variables.resource_project_name',
        title: this.$t('dictionary.project'),
      }),
      {
        field: 'initiator',
        title: '申请人',
        minWidth: 80,
        showOverflow: 'title',
        formatter: ({ cellVal, row }) => {
          return row.process_instance.start_user_name
        },
      },
      {
        field: 'state',
        title: '流程状态',
        minWidth: 80,
        showOverflow: 'title',
        slots: {
          default: ({ row }, h) => {
            if (row.process_definition_key === WORKFLOW_TYPES.CUSTOMER_SERVICE) {
              if (row.variables.satisfied) {
                return [
                  <span style="color: #7ed321;">已通过</span>,
                ]
              }
              return [
                <span style="color: #f6a100;">待处理</span>,
              ]
            }
            if (R.isNil(row.local_variables) || R.isEmpty(row.local_variables)) return '-'
            if (row.local_variables.approved) {
              return [
                <span style="color: #7ed321;">已通过</span>,
              ]
            }
            return [
              <span style="color: rgba(240, 61, 61, 1);">已驳回</span>,
            ]
          },
        },
      },
      getTimeTableColumn({ field: 'start_time', title: '创建日期' }),
      getTimeTableColumn({ field: 'end_time', title: '结束日期' }),
    ]
  },
}

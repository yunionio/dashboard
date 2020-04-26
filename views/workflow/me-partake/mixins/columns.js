import {
  getProcessDefinitionNameTableColumn,
  getResourceNameTableColumn,
  getResourceProjectTableColumn,
} from '../../utils/columns'
import { statusMap } from '../../utils'
import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

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
        field: 'assignee',
        title: '审批人',
        minWidth: 120,
        showOverflow: 'title',
        formatter: ({ cellVal, row }) => {
          let pit = row.process_instance.tasks
          let assignees = []
          if (Array.isArray(pit)) {
            pit.forEach((item) => {
              if (item.delete_reason === 'completed') {
                assignees.push(item.assignee_name)
              }
            })
          } else {
            if (pit && pit.delete_reason === 'completed') {
              assignees.push(pit.assignee_name)
            }
          }
          return assignees.join(',')
        },
      },
      getTimeTableColumn({ field: 'start_time', title: '创建日期' }),
      getTimeTableColumn({ field: 'end_time', title: '结束日期' }),
    ]
  },
}

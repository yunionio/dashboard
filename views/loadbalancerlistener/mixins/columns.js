import LbListCell from '@Network/views/lb/components/LbListCell'
import { LB_SCHEDULER_MAP } from '@Network/constants/lb'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'

export default {
  components: {
    LbListCell,
  },
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: '名称',
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'lb' }),
      {
        field: 'listener_type&listener_port',
        title: '前端协议:端口',
        minWidth: 150,
        formatter: ({ row }) => {
          return `${row.listener_type}:${row.listener_port}`
        },
      },
      {
        field: 'scheduler',
        title: '调度算法',
        minWidth: 100,
        formatter: ({ row }) => {
          if (!row.scheduler || row.redirect === 'raw') return '-'
          const scheduler = LB_SCHEDULER_MAP[row.scheduler]
          return scheduler ? scheduler.text : row.scheduler
        },
      },
      {
        field: 'backend_group',
        title: '后端服务器组',
        minWidth: 200,
        formatter: ({ row }) => {
          if (!row.backend_group || row.redirect === 'raw') return '-'
          return row.backend_group
        },
      },
      getStatusTableColumn({
        minWidth: 100,
        statusModule: 'lbHealth',
        field: 'health_check',
        title: '健康检查',
        slotCallback: (row) => {
          return row.redirect === 'raw' ? '-' : null
        },
      }),
      getStatusTableColumn({ minWidth: 100, statusModule: 'lbAcl', field: 'acl_status', title: '访问控制' }),
      getStatusTableColumn({ minWidth: 100, statusModule: 'lbRedirect', field: 'redirect', title: '重定向' }),
      getProjectTableColumn(),
    ]
  },
}

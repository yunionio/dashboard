import LbListCell from '@Network/views/lb/components/LbListCell'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
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
        edit: false,
        editDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ minWidth: 100, statusModule: 'lb' }),
      getStatusTableColumn({ minWidth: 100, statusModule: 'lbRedirect', field: 'redirect', title: '重定向' }),
      {
        field: 'domain',
        title: '域名',
        minWidth: 200,
      },
      {
        field: 'path',
        title: 'URL',
        minWidth: 200,
      },
      {
        field: 'backend_group',
        title: '后端服务器组',
        minWidth: 200,
        formatter: ({ row }) => {
          return row.redirect === 'off' && row.backend_group ? row.backend_group : '-'
        },
      },
    ]
  },
}

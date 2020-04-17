import LbListCell from '@Network/views/lb/components/LbListCell'
import {
  getNameDescriptionTableColumn,
  getRegionTableColumn,
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
        field: 'listener_type',
        title: '关联监听',
        minWidth: 300,
        slots: {
          default: ({ row }, h) => {
            const attrs = {
              props: {
                params: {
                  backend_group: row.id,
                  scope: this.$store.getters.scope,
                },
                type: 'lbBackendGroup',
                manager: new this.$Manager('loadbalancerlisteners', 'v2'),
                format: item => {
                  return `${item.listener_type}:${item.listener_port}`
                },
                status: row.status,
              },
            }
            return [<LbListCell { ...attrs } />]
          },
        },
      },
      getRegionTableColumn(),
      getProjectTableColumn(),
    ]
  },
}

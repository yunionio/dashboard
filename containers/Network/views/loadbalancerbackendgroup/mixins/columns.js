import LbListCell from '@Network/views/lb/components/LbListCell'
import {
  getNameDescriptionTableColumn,
  getRegionTableColumn,
  getStatusTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  components: {
    LbListCell,
  },
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        title: i18n.t('network.text_21'),
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'lb' }),
      {
        field: 'listeners',
        title: i18n.t('network.text_355'),
        type: 'expand',
        width: 100,
        slots: {
          default: ({ row }) => {
            return i18n.t('compute.text_619', [row.lb_listener_count || 0])
          },
          content: ({ row }, h) => {
            if (row.listeners && row.listeners.length > 0) {
              return row.listeners.map(item => {
                if (item.redirect !== 'off') return null
                return <a-tag class='mb-2'>{item.name}({item.listener_type}: {item.listener_port})</a-tag>
              })
            }
          },
        },
      },
      getRegionTableColumn(),
      getProjectTableColumn(),
    ]
  },
}

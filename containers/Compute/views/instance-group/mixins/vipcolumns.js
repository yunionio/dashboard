import { getCopyWithContentTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({ field: 'ip_addr', title: i18n.t('compute.vip_address'), sortable: true }),
      getCopyWithContentTableColumn({ field: 'ip6_addr', title: i18n.t('compute.vip_ipv6_address'), sortable: true }),
      getCopyWithContentTableColumn({ field: 'eip_addr', title: 'EIP', sortable: true }),
      {
        field: 'network_id',
        title: i18n.t('compute.text_106'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }, h) => {
            const ret = [
              <list-body-cell-wrap copy row={row} field="network" hideField={ true }>
                <side-page-trigger onTrigger={ () => this.handleOpenNetworkDetail(row.network_id) }>{ row.network }</side-page-trigger>
              </list-body-cell-wrap>,
            ]
            return ret
          },
        },
      },
      getTimeTableColumn({
        field: 'created_at',
        title: this.$t('compute.text_722'),
      }),
    ]
  },
}

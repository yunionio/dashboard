import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      {
        title: i18n.t('compute.text_375'),
        width: 50,
        slots: {
          default: ({ rowIndex }) => {
            return rowIndex
          },
        },
      },
      getCopyWithContentTableColumn({ field: 'ifname', title: i18n.t('compute.text_384'), sortable: true }),
      getCopyWithContentTableColumn({ field: 'mac_addr', title: i18n.t('compute.text_385'), sortable: true }),
      getCopyWithContentTableColumn({ field: 'ip_addr', title: i18n.t('compute.text_386'), sortable: true }),
      getCopyWithContentTableColumn({ field: 'driver', title: i18n.t('compute.text_378') }),
      {
        field: 'guest_id',
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
      {
        field: 'bw_limit',
        title: i18n.t('compute.text_387'),
        width: 100,
        formatter: ({ row }) => {
          return `${row.bw_limit}Mbps`
        },
        slots: {
          header: ({ column }) => {
            return [
              <a-tooltip title={i18n.t('compute.text_388')}>
                <span class='mr-1'>{ column.title }</span>
                <icon type="question" />
              </a-tooltip>,
            ]
          },
        },
      },
    ]
  },
}

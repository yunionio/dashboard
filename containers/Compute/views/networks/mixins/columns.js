import { getCopyWithContentTableColumn, getTimeTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      {
        field: 'index',
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
      getCopyWithContentTableColumn({ field: 'ip6_addr', title: i18n.t('compute.ipv6.address'), sortable: true }),
      getCopyWithContentTableColumn({ field: 'eip_addr', title: 'EIP', sortable: true }),
      getCopyWithContentTableColumn({ field: 'driver', title: i18n.t('compute.text_860') }),
      {
        field: 'guest_id',
        title: i18n.t('compute.text_106'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }, h) => {
            const ret = [
              <list-body-cell-wrap copy row={row} field="network" hideField={true}>
                <side-page-trigger onTrigger={() => this.handleOpenNetworkDetail(row.network_id)}>{row.network}</side-page-trigger>
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
          if (row.rx_bw_limit && row.tx_bw_limit) {
            return `${row.tx_bw_limit}Mbps/${row.rx_bw_limit}Mbps`
          }
          if (+row.bw_limit) {
            return `${row.bw_limit}Mbps`
          }
          return `0(${this.$t('common.not_limited')})`
        },
        slots: {
          default: ({ row }, h) => {
            const ret = []
            if (row.rx_bw_limit && row.tx_bw_limit) {
              ret.push(<div> <a-icon type="arrow-up" /> {row.tx_bw_limit} Mbps</div>)
              ret.push(<div> <a-icon type="arrow-down" /> {row.rx_bw_limit} Mbps</div>)
            } else if (+row.bw_limit) {
              ret.push(<div> <a-icon type="swap" /> {row.bw_limit}Mbps </div>)
            } else {
              ret.push(<div>0({this.$t('common.not_limited')})</div>)
            }
            return ret
          },
        },
      },
      {
        field: 'num_queues',
        title: i18n.t('compute.num_queues'),
        slots: {
          default: ({ row }) => {
            return row.num_queues || '-'
          },
        },
      },
      getStatusTableColumn({
        field: 'is_default',
        title: i18n.t('compute.nics.is_default'),
        statusModule: 'enabled',
        minWidth: 30,
      }),
      {
        field: 'network_addresses',
        title: i18n.t('compute.sub_ips.title'),
        slots: {
          default: ({ row }) => {
            const { network_addresses = [] } = row
            const ret = []
            network_addresses.map(item => {
              if (item.type === 'sub_ip') {
                ret.push(<list-body-cell-wrap copy row={{ ip: item.ip_addr }} field="ip" hideField={true}>{item.ip_addr}</list-body-cell-wrap>)
              }
            })
            return ret.length ? ret : '-'
          },
        },
      },
      {
        field: 'port_mappings',
        title: i18n.t('compute.port_mappings.title', 'port'),
        slots: {
          default: ({ row }) => {
            return [
              this.$t('compute.text_619', [row.port_mappings ? row.port_mappings.length : 0]),
              <a-button type="link" class={'pl-1'} onClick={() => this.viewContentDialog(row.port_mappings, this.$t('compute.port_mappings.title'), 'port')}>{this.$t('common.view')}</a-button>,
            ]
          },
        },
      },
      getTimeTableColumn(),
    ]
  },
  methods: {
    viewContentDialog (data, title, type) {
      this.createDialog('ViewContentDialog', {
        title,
        data,
        type,
      })
    },
  },
}

import i18n from '@/locales'
import { getCopyWithContentTableColumn, getTimeTableColumn, getStatusTableColumn, getBillingTypeTableColumn } from '@/utils/common/tableColumn'

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
      {
        field: 'ip_addr',
        title: i18n.t('compute.text_386'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }, h) => {
            if (row.ip_addr) {
              const addrs = [
                <div>{i18n.t('compute.text_386')}: {row.ip_addr}/{row.guest_ip_mask}</div>,
                <div>{i18n.t('network.ipv4.gateway')}: {row.guest_gateway}</div>,
              ]
              if (row.mapped_ip_addr) {
                addrs.push(<div>{i18n.t('compute.vpc.mapped_addr')}: {row.mapped_ip_addr}</div>)
              }
              const ret = [
                <a-popover>
                  <template slot="content">
                    {addrs}
                  </template>
                  <list-body-cell-wrap copy row={row} field="ip_addr" hideField={true}>
                    {row.ip_addr}/{row.guest_ip_mask}
                  </list-body-cell-wrap>
                </a-popover>,
              ]
              return ret
            }
            return '-'
          },
        },
      },
      {
        field: 'ip6_addr',
        title: i18n.t('compute.ipv6.address'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 200,
        slots: {
          default: ({ row }, h) => {
            if (row.ip6_addr) {
              const addrs = [
                <div>{i18n.t('compute.ipv6.address')}: {row.ip6_addr}/{row.guest_ip6_mask}</div>,
                <div>{i18n.t('network.ipv6.gateway')}: {row.guest_gateway6}</div>,
              ]
              if (row.mapped_ip6_addr) {
                addrs.push(<div>{i18n.t('compute.vpc.mapped_addr')}: {row.mapped_ip6_addr}</div>)
              }
              const ret = [
                <a-popover>
                  <template slot="content">
                    {addrs}
                  </template>
                  <list-body-cell-wrap copy row={row} field="ip6_addr" hideField={true}>
                    {row.ip6_addr}/{row.guest_ip6_mask}
                  </list-body-cell-wrap>
                </a-popover>,
              ]
              return ret
            }
            return '-'
          },
        },
      },
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
          if (+row.bw_limit) {
            return `${row.bw_limit}Mbps`
          }
          return `0(${this.$t('common.not_limited')})`
        },
        // slots: {
        //   header: ({ column }) => {
        //     return [
        //       <a-tooltip title={i18n.t('compute.text_388')}>
        //         <span class='mr-1'>{ column.title }</span>
        //         <icon type="question" />
        //       </a-tooltip>,
        //     ]
        //   },
        // },
      },
      getBillingTypeTableColumn(),
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

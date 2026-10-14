import i18n from '@/locales'

export const getIpAddrColumn = () => {
  return {
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
  }
}

export const getIp6AddrColumn = () => {
  return {
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
  }
}

export const getNetworkIdColumn = ({ vm } = {}) => {
  return {
    field: 'network_id',
    title: i18n.t('compute.text_106'),
    sortable: true,
    showOverflow: 'ellipsis',
    minWidth: 100,
    slots: {
      default: ({ row }, h) => {
        const ret = [
          <list-body-cell-wrap copy row={row} field="network" hideField={true}>
            <side-page-trigger onTrigger={() => vm.handleOpenNetworkDetail(row.network_id)}>{row.network}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
        return ret
      },
    },
  }
}

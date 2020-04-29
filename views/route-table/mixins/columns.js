import {
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'

const routeType = {
  system: '系统路由',
  custom: '自定义路由',
  bgp: 'BGP路由',
  ip: '自定义路由',
  peering: '对等连接路由',
}

const nextHopType = {
  Instance: 'ECS实例',
  HaVip: '高可用虚拟IP',
  RouterInterface: '路由器接口',
  NetworkInterface: '弹性网卡',
  VpnGateway: 'VPN网关',
  IPv6Gateway: 'IPv6网关',
}

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn(),
      {
        field: 'routes',
        title: '条目（路由表类型 目标网段 下一跳）',
        minWidth: 220,
        showOverflow: 'title',
        slots: {
          default: ({ row }, h) => {
            return [
              h('div', row.routes.map(route => {
                const { type, cidr, next_hop_type: next } = route
                let routeItem = ''
                if (type) routeItem += ` ${routeType[type.toLowerCase()] || type}`
                if (cidr) routeItem += ` ${cidr}`
                if (next) routeItem += ` ${nextHopType[next.toLowerCase()] || next}`
                return h('a-tag', {
                  class: 'text-truncate',
                  style: {
                    display: 'block',
                  },
                  props: {
                    size: 'mini',
                    type: 'info',
                  },
                }, routeItem)
              })),
            ]
          },
        },
      },
      {
        field: 'vpc',
        title: '所属专有网络',
        minWidth: 120,
        showOverflow: 'ellipsis',
      },
      getBrandTableColumn(),
      getAccountTableColumn(),
      getPublicScopeTableColumn({ vm: this }),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
    ]
  },
}

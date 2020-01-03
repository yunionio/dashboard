<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import { getCopyWithContentTableColumn, getRegionTableColumn, getAccountTableColumn } from '@/utils/common/tableColumn'
import windows from '@/mixins/windows'

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
  name: 'RouteTableList',
  mixins: [windows],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'route_tables',
        getParams: { details: true },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(val)`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn(),
        {
          field: 'vpc',
          title: '所属专有网络',
          minWidth: 70,
          showOverflow: 'ellipsis',
        },
        getRegionTableColumn(),
        getAccountTableColumn(),
        {
          field: 'routes',
          title: '条目（路由表类型 目标网段 下一条）',
          minWidth: 100,
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
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>

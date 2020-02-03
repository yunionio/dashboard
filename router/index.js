import Layout from '@Compute/components/Layout'
import Network from '@Network/views/network'
import NetworkCreate from '@Network/views/network/Create'
import EditAttributes from '@Network/views/network/EditAttributes'
import Eip from '@Network/views/eip'
import FlexNetwork from '@Network/views/flex-network'
import Wire from '@Network/views/wire'
import GolbalVpc from '@Network/views/global-vpc'
import Vpc from '@Network/views/vpc'
import RouteTableList from '@Network/views/route-table'
import NatList from '@Network/views/nats'
import ReservedIpList from '@Network/views/reserved-ip'
import DNSList from '@Network/views/dns'

export default {
  index: 3,
  meta: {
    label: '网络',
    icon: 'menu-network',
  },
  menus: [
    {
      meta: {
        label: '基础网络',
      },
      submenus: [
        {
          path: '/globalvpc',
          meta: {
            label: '全局VPC',
            permission: 'network_globalvpcs_list',
          },
          component: Layout,
          children: [
            {
              name: 'GlobalVPC',
              path: '',
              component: GolbalVpc,
            },
          ],
        },
        {
          path: '/vpc',
          meta: {
            label: 'VPC',
            permission: 'vpcs_list',
          },
          component: Layout,
          children: [
            {
              name: 'VPC',
              path: '',
              component: Vpc,
            },
          ],
        },
        {
          path: '/routetable',
          meta: {
            label: '路由表',
            permission: 'route_tables_list',
          },
          component: Layout,
          children: [
            {
              name: 'RouteTable',
              path: '',
              component: RouteTableList,
            },
          ],
        },
        {
          path: '/nat',
          meta: {
            label: 'NAT网关',
            permission: 'natgateways_list',
          },
          component: Layout,
          children: [
            {
              name: 'Nat',
              path: '',
              component: NatList,
            },
          ],
        },
        {
          path: '/wire',
          meta: {
            label: '二层网络',
            permission: 'wires_list',
          },
          component: Layout,
          children: [
            {
              name: 'WireList',
              path: '',
              component: Wire,
            },
          ],
        },
        {
          path: '/eip',
          meta: {
            label: '弹性公网IP',
            permission: 'eips_list',
          },
          component: Layout,
          children: [
            {
              name: 'Eip',
              path: '',
              component: Eip,
            },
          ],
        },
        {
          path: '/flexnetwork',
          meta: {
            label: '弹性网卡',
            permission: 'networkcard_list',
          },
          component: Layout,
          children: [
            {
              name: 'NetworkcardList',
              path: '',
              component: FlexNetwork,
            },
          ],
        },
        {
          path: '/network',
          meta: {
            label: 'IP子网',
            permission: 'networks_list',
          },
          component: Layout,
          children: [
            {
              name: 'Network',
              path: '',
              component: Network,
            },
            {
              name: 'NetworkCreate',
              path: 'create',
              component: NetworkCreate,
            },
            {
              name: 'NetworkUpdate',
              path: 'edit',
              component: EditAttributes,
            },
          ],
        },
        {
          path: '/reservedip',
          meta: {
            label: '预留IP',
            permission: 'reservedips_list',
          },
          component: Layout,
          children: [
            {
              name: 'ReservedIP',
              path: '',
              component: ReservedIpList,
            },
          ],
        },
        {
          path: '/dns',
          meta: {
            label: '域名服务',
            permission: 'dnsrecords_list',
          },
          component: Layout,
          children: [
            {
              name: 'DNS',
              path: '',
              component: DNSList,
            },
          ],
        },
      ],
    },
  ],
}

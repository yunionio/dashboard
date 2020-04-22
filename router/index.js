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
import LbaclsList from '@Network/views/lbacls'
import LbcertsList from '@Network/views/lbcerts'
import LoadbalancerclusterList from '@Network/views/loadbalancercluster'
import AgentList from '@Network/views/agent'
import AgentCreate from '@Network/views/agent/create'
import AgentAsbook from '@Network/views/agent/asbook'
import Layout from '@/layouts/RouterView'

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
              name: this.$t('vpc'),
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
    {
      meta: {
        label: '负载均衡',
      },
      submenus: [
        {
          path: '/lbacl',
          meta: {
            label: '访问控制',
            permission: 'lb_loadbalanceracls_list',
          },
          component: Layout,
          children: [
            {
              name: 'LbaclsList',
              path: '',
              component: LbaclsList,
            },
          ],
        },
        {
          path: '/lbcert',
          meta: {
            label: '证书',
            permission: 'lb_loadbalancercertificates_list',
          },
          component: Layout,
          children: [
            {
              name: 'LbcertsList',
              path: '',
              component: LbcertsList,
            },
          ],
        },
      ],
    },
    {
      meta: {
        label: '负载均衡集群',
      },
      submenus: [
        {
          path: '/cluster',
          meta: {
            label: '集群',
            permission: 'lb_loadbalancerclusters_list',
          },
          component: Layout,
          children: [
            {
              name: 'LoadbalancerclusterList',
              path: '',
              component: LoadbalancerclusterList,
            },
          ],
        },
        {
          path: '/lbagent',
          meta: {
            label: '节点',
            permission: 'lb_loadbalanceragents_list',
          },
          component: Layout,
          children: [
            {
              name: 'AgentList',
              path: '',
              component: AgentList,
            },
            {
              name: 'AgentCreate',
              path: 'create',
              component: AgentCreate,
            },
            {
              name: 'AgentAsbook',
              path: 'asbook',
              component: AgentAsbook,
            },
          ],
        },
      ],
    },
  ],
}

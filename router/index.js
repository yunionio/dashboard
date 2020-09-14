// import FlexNetwork from '@Network/views/flex-network'
import DnsZone from '@Network/views/dns-zone'
import EipCreate from '@Network/views/eip/create'
import Wire from '@Network/views/wire'
import Network from '@Network/views/network'
import NetworkCreate from '@Network/views/network/Create'
import EditAttributes from '@Network/views/network/EditAttributes'
import Eip from '@Network/views/eip'
import GlobalVpc from '@Network/views/global-vpc'
// import RouteTableList from '@Network/views/route-table'
import NatList from '@Network/views/nats'
// import ReservedIpList from '@Network/views/reserved-ip'
import DNS from '@Network/views/dns'
import VPC from '@Network/views/vpc'
import VPCCreate from '@Network/views/vpc/create'
import LbList from '@Network/views/lb'
import LBCreate from '@Network/views/lb/create/index'
import LbListenerCreate from '@Network/views/loadbalancerlistener/create'
import LbaclsList from '@Network/views/lbacls'
import LbcertsList from '@Network/views/lbcerts'
import LoadbalancerclusterList from '@Network/views/loadbalancercluster'
import AgentList from '@Network/views/agent'
import AgentForm from '@Network/views/agent/form'
import Layout from '@/layouts/RouterView'

import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'
import store from '@/store'

export default {
  index: 4,
  meta: {
    label: i18n.t('network.text_16'),
    icon: 'menu-network',
  },
  menus: [
    /**
     * 基础网络
     */
    {
      meta: {
        label: i18n.t('network.text_711'),
      },
      submenus: [
        {
          path: '/globalvpc',
          meta: {
            label: '全局VPC',
            permission: 'network_globalvpcs_list',
            t: 'dictionary.globalvpc',
            hidden: () => !hasSetupKey('google'),
          },
          component: Layout,
          children: [
            {
              name: 'GlobalVPC',
              path: '',
              component: GlobalVpc,
            },
          ],
        },
        {
          path: '/vpc',
          meta: {
            label: 'VPC',
            permission: 'vpcs_list',
            t: 'dictionary.vpc',
            hidden: () => !hasSetupKey(['openstack', 'onestack', 'zstack', 'dstack', 'public', 'baremetal']),
          },
          component: Layout,
          children: [
            {
              name: 'VPC',
              path: '',
              component: VPC,
            },
            {
              name: 'VPCCreate',
              path: 'create',
              component: VPCCreate,
            },
          ],
        },
        // {
        //   path: '/routetable',
        //   meta: {
        //     label: '路由表',
        //     permission: 'route_tables_list',
        //   },
        //   component: Layout,
        //   children: [
        //     {
        //       name: 'RouteTable',
        //       path: '',
        //       component: RouteTableList,
        //     },
        //   ],
        // },
        {
          path: '/wire',
          meta: {
            label: '二层网络',
            permission: 'wires_list',
            t: 'dictionary.wire',
            hidden: () => !hasSetupKey(['onestack', 'vmware', 'zstack', 'dstack']),
            // hidden: () => !hasServices(['esxiagent', 'hostagent', 'bmagent']) && !hasBrands('ZStack'),
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
        // {
        //   path: '/flexnetwork',
        //   meta: {
        //     label: '弹性网卡',
        //     permission: 'networkcard_list',
        //   },
        //   component: Layout,
        //   children: [
        //     {
        //       name: 'NetworkcardList',
        //       path: '',
        //       component: FlexNetwork,
        //     },
        //   ],
        // },
        {
          path: '/network',
          meta: {
            label: 'IP子网',
            permission: 'networks_list',
            t: 'dictionary.network',
            hidden: () => !hasSetupKey(['onestack', 'private', 'public', 'baremetal', 'vmware']),
          },
          component: Layout,
          children: [
            {
              name: 'NetworkList',
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
        // {
        //   path: '/reservedip',
        //   meta: {
        //     label: '预留IP',
        //     permission: 'reservedips_list',
        //   },
        //   component: Layout,
        //   children: [
        //     {
        //       name: 'ReservedIP',
        //       path: '',
        //       component: ReservedIpList,
        //     },
        //   ],
        // },
      ],
    },
    /**
     * 网络服务
     */
    {
      meta: {
        label: i18n.t('network.text_712'),
      },
      submenus: [
        {
          path: '/eip',
          meta: {
            label: '弹性公网IP',
            permission: 'eips_list',
            t: 'dictionary.eip',
            hidden: () => !hasSetupKey(['onestack', 'private', 'public']),
          },
          component: Layout,
          children: [
            {
              name: 'EipList',
              path: '',
              component: Eip,
            },
            {
              name: 'EipCreate',
              path: 'create',
              component: EipCreate,
            },
          ],
        },
        {
          path: '/nat',
          meta: {
            label: 'NAT网关',
            permission: 'natgateways_list',
            t: 'dictionary.nat',
            hidden: () => !hasSetupKey(['aliyun', 'huawei']),
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
          path: '/dns',
          meta: {
            label: '域名服务',
            permission: 'dnsrecords_list',
            t: 'dictionary.dns',
            hidden: () => true,
          },
          component: Layout,
          children: [
            {
              name: 'DNS',
              path: '',
              component: DNS,
            },
          ],
        },
        {
          path: '/dns-zone',
          meta: {
            label: i18n.t('dictionary.dns_zone'),
            permission: 'dnszone_list',
            hidden: () => store.getters.isProjectMode || !hasSetupKey(['aws', 'qcloud']),
          },
          component: Layout,
          children: [
            {
              name: 'DnsZone',
              path: '',
              component: DnsZone,
            },
          ],
        },
      ],
    },
    /**
     * 负载均衡
     */
    {
      meta: {
        label: i18n.t('network.text_713'),
        hidden: () => !hasSetupKey(['lb', 'aliyun', 'huawei', 'qcloud', 'aws', 'k8s']),
        labelAlias: '网络负载均衡',
        // hidden: () => !hasServices('lbagent') && !hasHypervisors(['aliyun', 'qcloud', 'huawei', 'aws']),
      },
      submenus: [
        {
          path: '/lb',
          meta: {
            label: i18n.t('network.text_714'),
            permission: 'lb_loadbalancers_list',
          },
          component: Layout,
          children: [
            {
              name: 'LBList',
              path: '',
              component: LbList,
            },
            {
              name: 'LBCreate',
              path: 'create',
              component: LBCreate,
            },
            {
              name: 'LBSDetailListenerCreate',
              path: ':id/listener-create',
              component: LbListenerCreate,
            },
            {
              name: 'LBSDetailListenerUpdate',
              path: ':id/listener-update',
              component: LbListenerCreate,
            },
          ],
        },
        {
          path: '/lbacl',
          meta: {
            label: i18n.t('network.text_715'),
            permission: 'lb_loadbalanceracls_list',
          },
          component: Layout,
          children: [
            {
              name: 'LbaclList',
              path: '',
              component: LbaclsList,
            },
          ],
        },
        {
          path: '/lbcert',
          meta: {
            label: i18n.t('network.text_716'),
            permission: 'lb_loadbalancercertificates_list',
          },
          component: Layout,
          children: [
            {
              name: 'LbcertList',
              path: '',
              component: LbcertsList,
            },
          ],
        },
      ],
    },
    /**
     * 负载均衡集群
     */
    {
      meta: {
        label: i18n.t('network.text_17'),
        hidden: () => !hasSetupKey(['lb', 'k8s']),
        labelAlias: i18n.t('network.text_18'),
      },
      submenus: [
        {
          path: '/cluster',
          meta: {
            label: i18n.t('network.text_19'),
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
            label: i18n.t('network.text_20'),
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
              name: 'AgentForm',
              path: 'form',
              component: AgentForm,
            },
          ],
        },
      ],
    },
  ],
}

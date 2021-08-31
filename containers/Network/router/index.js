// import FlexNetwork from '@Network/views/flex-network'
import DnsZone from '@Network/views/dns-zone'
import DnsZoneCreate from '@Network/views/dns-zone/create'
import EipCreate from '@Network/views/eip/create'
import Wire from '@Network/views/wire'
import Network from '@Network/views/network'
import NetworkCreate from '@Network/views/network/Create'
import EditAttributes from '@Network/views/network/EditAttributes'
import BatchEditAttributes from '@Network/views/network/BatchEditAttributes'
import Eip from '@Network/views/eip'
import Waf from '@Network/views/waf'
import GlobalVpc from '@Network/views/global-vpc'
// import RouteTableList from '@Network/views/route-table'
import NatList from '@Network/views/nats'
import NatCreate from '@Network/views/nats/create/index'
// import ReservedIpList from '@Network/views/reserved-ip'
// import DNS from '@Network/views/dns'
import VPC from '@Network/views/vpc'
import VPCCreate from '@Network/views/vpc/create'
import LbList from '@Network/views/lb'
import LBCreate from '@Network/views/lb/create/index'
import LbListenerCreate from '@Network/views/loadbalancerlistener/create'
import LbaclsList from '@Network/views/lbacls'
import LbcertsList from '@Network/views/lbcerts'
import LoadbalancerclusterList from '@Network/views/loadbalancercluster'
import SshProxyList from '@Network/views/ssh-proxy'
import SshProxyCreate from '@Network/views/ssh-proxy/form'
import SshAgentList from '@Network/views/ssh-agent'
// import LoadbalancerclusterList from '@Network/views/ssh-service'
import AgentList from '@Network/views/agent'
import AgentForm from '@Network/views/agent/form'
import Layout from '@/layouts/RouterView'
import Cloudregion from '@Cloudenv/views/cloudregion'
import Zone from '@Cloudenv/views/zone'
import DomainList from '@Network/views/cdn'

import { hasSetupKey } from '@/utils/auth'
import i18n from '@/locales'
import store from '@/store'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

export default {
  index: 40,
  meta: {
    label: i18n.t('network.text_16'),
    icon: 'menu-network',
  },
  menus: [
    {
      meta: {
        label: i18n.t('cloudenv.text_9'),
      },
      submenus: [
        {
          path: '/cloudregion',
          meta: {
            label: i18n.t('cloudenv.text_10'),
            permission: 'areas_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cloudregion')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'vmware'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Cloudregion',
              path: '',
              component: Cloudregion,
            },
          ],
        },
        {
          path: '/zone',
          meta: {
            label: i18n.t('cloudenv.text_11'),
            permission: 'zones_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.zone')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'vmware'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Zone',
              path: '',
              component: Zone,
            },
          ],
        },
      ],
    },
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
            label: i18n.t('dictionary.globalvpc'),
            permission: 'network_globalvpcs_list',
            t: 'dictionary.globalvpc',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.globalvpc')) {
                return true
              }
              return !hasSetupKey('google')
            },
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
            label: i18n.t('dictionary.vpc'),
            permission: 'vpcs_list',
            t: 'dictionary.vpc',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.vpc')) {
                return true
              }
              return !hasSetupKey(['openstack', 'onestack', 'zstack', 'dstack', 'public', 'baremetal', 'apsara', 'hcso'])
            },
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
            label: i18n.t('dictionary.wire'),
            permission: 'wires_list',
            t: 'dictionary.wire',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.wire')) {
                return true
              }
              return !hasSetupKey(['onestack', 'vmware', 'zstack', 'dstack'])
            },
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
            label: i18n.t('dictionary.network'),
            permission: 'networks_list',
            t: 'dictionary.network',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.network')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'public', 'baremetal', 'vmware'])
            },
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
            {
              name: 'NetworkBatchUpdate',
              path: 'batch-edit',
              component: BatchEditAttributes,
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
            label: i18n.t('dictionary.eip'),
            permission: 'eips_list',
            t: 'dictionary.eip',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.eip')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'public'])
            },
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
            label: i18n.t('dictionary.nat'),
            permission: 'natgateways_list',
            t: 'dictionary.nat',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.nat')) {
                return true
              }
              return !hasSetupKey(['aliyun', 'huawei', 'hcso'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'Nat',
              path: '',
              component: NatList,
            },
            {
              name: 'NatCreate',
              path: 'create',
              component: NatCreate,
            },
          ],
        },
        /* {
          path: '/dns',
          meta: {
            label: i18n.t('dictionary.dns'),
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
        }, */
        {
          path: '/dns-zone',
          meta: {
            label: i18n.t('dictionary.dns_zone'),
            permission: 'dnszone_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.dns_zone')) {
                return true
              }
              return store.getters.isProjectMode || !hasSetupKey(['aws', 'qcloud', 'aliyun'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'DnsZone',
              path: '',
              component: DnsZone,
            },
            {
              name: 'DnsZoneCreate',
              path: 'create',
              component: DnsZoneCreate,
            },
          ],
        },
      ],
    },
    /**
     * 网络安全
     */
    {
      meta: {
        label: i18n.t('network.text_756'),
      },
      submenus: [
        {
          path: '/waf',
          meta: {
            label: i18n.t('dictionary.waf_instance'),
            permission: 'wafs_list',
            t: 'dictionary.waf_instance',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.waf')) {
                return true
              }
              return (store.getters.isDomainMode || store.getters.isAdminMode) && !hasSetupKey(['aws', 'azure', 'aliyun'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'WafList',
              path: '',
              component: Waf,
            },
          ],
        },
      ],
    },
    /**
     * SSH代理
     */
    {
      meta: {
        label: i18n.t('network.ssh-proxy.title'),
        hidden: () => (store.getters.isProjectMode || !hasSetupKey(['private', 'vmware', 'public', 'onestack'])),
      },
      submenus: [
        {
          path: '/ssh-proxy',
          meta: {
            label: i18n.t('network.ssh-proxy.endpoints'),
            permission: 'sshproxy_node_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ssh_proxy')) {
                return true
              }
              return !hasSetupKey(['private', 'vmware', 'public', 'onestack'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'SshProxyList',
              path: '',
              component: SshProxyList,
            },
            {
              name: 'SshProxyCreate',
              path: 'create',
              component: SshProxyCreate,
            },
          ],
        },
        {
          path: '/ssh-agent',
          meta: {
            label: i18n.t('network.ssh-proxy.proxyservice'),
            permission: 'sshproxy_service_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ssh-agent')) {
                return true
              }
              return store.getters.isDomainMode || !hasSetupKey(['private', 'vmware', 'public', 'onestack'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'SshAgentList',
              path: '',
              component: SshAgentList,
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
        labelAlias: '网络负载均衡',
        // hidden: () => !hasServices('lbagent') && !hasHypervisors(['aliyun', 'qcloud', 'huawei', 'aws']),
      },
      submenus: [
        {
          path: '/lb',
          meta: {
            label: i18n.t('network.text_714'),
            permission: 'lb_loadbalancers_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.lb')) {
                return true
              }
              return !hasSetupKey(['lb', 'aliyun', 'huawei', 'qcloud', 'aws', 'k8s', 'apsara', 'hcso'])
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.lbacl')) {
                return true
              }
              return !hasSetupKey(['lb', 'aliyun', 'huawei', 'qcloud', 'aws', 'k8s', 'hcso'])
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.lbcert')) {
                return true
              }
              return !hasSetupKey(['lb', 'aliyun', 'huawei', 'qcloud', 'aws', 'k8s', 'apsara', 'hcso'])
            },
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
        labelAlias: i18n.t('network.text_18'),
      },
      submenus: [
        {
          path: '/cluster',
          meta: {
            label: i18n.t('network.text_19'),
            permission: 'lb_loadbalancerclusters_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cluster')) {
                return true
              }
              return !hasSetupKey(['lb', 'k8s'])
            },
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
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.lbagent')) {
                return true
              }
              return !hasSetupKey(['lb', 'k8s'])
            },
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
    {
      meta: {
        label: i18n.t('dictionary.cdn'),
      },
      submenus: [
        {
          path: '/cdn',
          meta: {
            label: i18n.t('dictionary.cdn_domain'),
            permission: 'cdn_domains_list',
            t: 'dictionary.cdn_domain',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.cdn')) {
                return true
              }
              return !hasSetupKey(['onestack', 'private', 'public'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'DomainList',
              path: '',
              component: DomainList,
            },
          ],
        },
      ],
    },
  ],
}

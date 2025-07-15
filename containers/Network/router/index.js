// import FlexNetwork from '@Network/views/flex-network'
// import ReservedIpList from '@Network/views/reserved-ip'
// import DNS from '@Network/views/dns'
// import LoadbalancerclusterList from '@Network/views/ssh-service'

import Layout from '@/layouts/RouterView'
import { hasSetupKey, isBaremetalProduct } from '@/utils/auth'
import i18n from '@/locales'
import store from '@/store'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

const AgentList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/agent')
const AgentForm = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/agent/form')
const Cloudregion = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Cloudenv/views/cloudregion')
const Zone = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Cloudenv/views/zone')
const CdnList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/cdn')
const CdnCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/cdn/create')
const SslCertificateList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/ssl-certificate')
const VpcPeerConnectCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/vpc-peer-connect/create')
const Ipv6Gateway = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/ipv6-gateway')
const DnsZone = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/dns-zone')
const DnsZoneCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/dns-zone/create')
const EipCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/eip/create')
const Wire = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/wire')
const Network = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/network')
const NetworkCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/network/Create')
const EditAttributes = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/network/EditAttributes')
const BatchEditAttributes = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/network/BatchEditAttributes')
const Eip = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/eip')
const Waf = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/waf')
const GlobalVpc = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/global-vpc')
const GlobalVpcCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/global-vpc/create')
const RouteTableList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/route-table')
const NatList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/nats')
const NatCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/nats/create/index')
const VPC = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/vpc')
const VpcNetwork = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/vpc-network')
const VpcPeerConnect = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/vpc-peer-connect')
const VPCCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/vpc/create')
const LbList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/lb')
const LBCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/lb/create/index')
const LbListenerCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/loadbalancerlistener/create')
const LbaclsList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/lbacls')
const LbcertsList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/lbcerts')
const LoadbalancerclusterList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/loadbalancercluster')
const LBClusterUpdate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/loadbalancercluster/update')
const SshProxyList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/ssh-proxy')
const SshProxyCreate = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/ssh-proxy/form')
const SshAgentList = () => import(/* webpackChunkName: "network" */ /* webpackPrefetch: true */ '@Network/views/ssh-agent')
const WebApp = () => import(/* webpackChunkName: "compute" */ /* webpackPrefetch: true */ '@Compute/views/webapp')

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
              return !hasSetupKey(['onestack', 'private', 'vmware', 'baremetal'])
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
              return !hasSetupKey(['onestack', 'private', 'vmware', 'baremetal'])
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
          path: '/vpc-network',
          meta: {
            permission: 'inter_vpc_networks_list',
            label: i18n.t('dictionary.vpc_network'),
            t: 'dictionary.vpc_network',
            hidden: () => {
              if (store.getters.isProjectMode || isScopedPolicyMenuHidden('sub_hidden_menus.vpc_network')) return true
              return !hasSetupKey(['aliyun', 'qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'VpcNetwork',
              path: '',
              component: VpcNetwork,
            },
          ],
        },
        {
          path: '/vpc-peerconnect',
          meta: {
            label: i18n.t('dictionary.vpc_peer_connect'),
            permission: 'vpc_peering_connections_list',
            t: 'dictionary.vpc_peer_connect',
            hidden: () => {
              if (store.getters.isProjectMode || isScopedPolicyMenuHidden('sub_hidden_menus.vpc_peerconnect')) return true
              return !hasSetupKey(['qcloud', 'huawei', 'aws', 'hcs'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'VpcPeerConnect',
              path: '',
              component: VpcPeerConnect,
            },
            {
              name: 'VpcPeerConnectCreate',
              path: 'create',
              component: VpcPeerConnectCreate,
            },
          ],
        },
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
            {
              name: 'GlobalVpcCreate',
              path: 'create',
              component: GlobalVpcCreate,
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
              if (store.getters?.globalSetting?.value?.productVersion === 'LightEdge') {
                return true
              }
              return isBaremetalProduct() || !hasSetupKey(['openstack', 'onestack', 'zstack', 'dstack', 'public', 'baremetal', 'apsara', 'hcso', 'hcs', 'bingocloud'])
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
        {
          path: '/routetable',
          meta: {
            label: i18n.t('dictionary.route_table'),
            permission: 'route_tables_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.routetable')) {
                return true
              }
              if (store.getters.isProjectMode) return true
              return !hasSetupKey(['aliyun', 'qcloud', 'huawei', 'aws', 'hcs'])
            },
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
          path: '/wire',
          meta: {
            label: i18n.t('dictionary.wire'),
            permission: 'wires_list',
            t: 'dictionary.wire',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.wire')) {
                return true
              }
              return !hasSetupKey(['onestack', 'vmware', 'zstack', 'dstack', 'nutanix', 'baremetal'])
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
              name: 'NetworkIndex',
              path: '',
              component: Network,
              meta: {
                key: '/network',
                keepAlive: true,
                keepAliveViews: ['NetworkUpdate', 'NetworkBatchUpdate'],
              },
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
              return !hasSetupKey(['aliyun', 'huawei', 'hcso', 'hcs'])
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
        // {
        //   path: '/dns',
        //   meta: {
        //     label: i18n.t('dictionary.dns'),
        //     permission: 'dnsrecords_list',
        //     t: 'dictionary.dns',
        //     // hidden: () => true,
        //   },
        //   component: Layout,
        //   children: [
        //     {
        //       name: 'DNS',
        //       path: '',
        //       component: DNS,
        //     },
        //   ],
        // },
        {
          path: '/dns-zone',
          meta: {
            label: i18n.t('dictionary.dns_zone'),
            permission: 'dns_zones_list',
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
        {
          path: '/ipv6-gateway',
          meta: {
            label: i18n.t('dictionary.ipv6_gateway'),
            permission: 'ipv6_gateways_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ipv6_gateway')) {
                return true
              }
              return !hasSetupKey(['apsara', 'aliyun'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'IPv6Gateway',
              path: '',
              component: Ipv6Gateway,
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
            permission: 'waf_instances_list',
            t: 'dictionary.waf_instance',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.waf')) return true
              if (!(store.getters.isDomainMode || store.getters.isAdminMode)) return true
              return !hasSetupKey(['aws', 'azure', 'aliyun', 'qcloud'])
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
        {
          path: '/webapp',
          meta: {
            label: i18n.t('compute.webapp'),
            permission: 'webapps_list',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.webapp')) {
                return true
              }
              return !hasSetupKey(['azure'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'WebApp',
              path: '',
              component: WebApp,
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
        hidden: () => (store.getters.isProjectMode || !hasSetupKey(['private', 'vmware', 'public'])),
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
              return !hasSetupKey(['private', 'vmware', 'public'])
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
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ssh_agent')) {
                return true
              }
              return store.getters.isDomainMode || !hasSetupKey(['private', 'vmware', 'public'])
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
              return !hasSetupKey(['lb', 'aliyun', 'huawei', 'qcloud', 'aws', 'k8s', 'apsara', 'hcso', 'hcs', 'azure', 'google'])
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
              return !hasSetupKey(['lb', 'aliyun', 'huawei', 'qcloud', 'aws', 'k8s', 'hcso', 'hcs', 'azure', 'google'])
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
              return !hasSetupKey(['lb', 'aliyun', 'huawei', 'qcloud', 'aws', 'k8s', 'apsara', 'hcso', 'hcs', 'azure', 'google'])
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
              name: 'LoadbalancerclusterIndex',
              path: '',
              component: LoadbalancerclusterList,
              meta: {
                key: '/cluster',
                keepAlive: true,
                keepAliveViews: ['LBClusterUpdate'],
              },
            },
            {
              name: 'LBClusterUpdate',
              path: 'update',
              component: LBClusterUpdate,
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
              name: 'AgentIndex',
              path: '',
              component: AgentList,
              meta: {
                key: '/lbagent',
                keepAlive: true,
                keepAliveViews: ['AgentForm'],
              },
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
              return !hasSetupKey(['aliyun', 'qcloud'])
            },
          },
          component: Layout,
          children: [
            {
              name: 'CdnList',
              path: '',
              component: CdnList,
            },
            {
              name: 'CdnCreate',
              path: 'create',
              component: CdnCreate,
            },
          ],
        },
        {
          path: '/ssl-certificate',
          meta: {
            label: i18n.t('network.ssl_certificate'),
            permission: 'ssl_certificates_list',
            t: 'network.ssl_certificate',
            hidden: () => {
              if (isScopedPolicyMenuHidden('sub_hidden_menus.ssl_certificate')) {
                return true
              }
              return false
            },
          },
          component: Layout,
          children: [
            {
              name: 'SslCertificateList',
              path: '',
              component: SslCertificateList,
            },
          ],
        },
      ],
    },
  ],
}

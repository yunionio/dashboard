import i18n from '@/locales'
import { arrayToObj } from '@/utils/utils'

export const NEXT_HOP_TYPES = [
  { key: 'Instance', value: i18n.t('network.instance') }, // ECS实例
  { key: 'HaVip', value: i18n.t('network.ha_vip') }, // 高可用虚拟IP
  { key: 'VpnGateway', value: i18n.t('network.vpn_gateway') }, // VPN网关
  { key: 'NatGateway', value: i18n.t('network.nat_gateway') }, // NAT网关
  { key: 'NetworkInterface', value: i18n.t('network.network_interface') }, // 辅助弹性网卡
  { key: 'Eip', value: i18n.t('network.eip') }, // 弹性IP
  { key: 'RouterInterface', value: i18n.t('network.router_interface') }, // 路由器接口
  { key: 'IPv6Gateway', value: i18n.t('network.ipv6_gateway') }, // IPv6网关
  { key: 'InternetGateway', value: i18n.t('network.internet_gateway') }, // Internet网关
  { key: 'EgressInternetGateway', value: i18n.t('network.egress_internet_gateway') }, // egress only Internet网关
  { key: 'VpcPeering', value: i18n.t('network.vpc_peering') }, // vpc对等连接
  { key: 'InterVpcNetwork', value: i18n.t('network.inter_vpc_network') }, // vpc 互联网络
  { key: 'DirectConnection', value: i18n.t('network.direct_connection') }, // 专线
  { key: 'VPC', value: i18n.t('network.vpc') }, // VPC
  { key: 'VBR', value: i18n.t('network.vbr') }, // 边界路由器
]

export const NEXT_HOP_TYPES_MAP = arrayToObj(NEXT_HOP_TYPES, 'key')

export const TYPES = [
  { key: 'System', value: i18n.t('network.system') },
  { key: 'Custom', value: i18n.t('network.custom') },
  { key: 'Propagate', value: i18n.t('network.propagate') },
]

export const TYPES_MAP = arrayToObj(TYPES, 'key')

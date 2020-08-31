import expectStatus from '@/constants/expectStatus'

export default {
  // 主机
  VmInstanceSidePage: {
    resource: 'servers',
    steadyStatus: Object.values(expectStatus.server).flat(),
  },
  // 主机组
  InstanceGroupSidePage: {
    resource: 'instancegroups',
  },
  // 系统镜像
  SystemImageSidePage: {
    resource: 'images',
    apiVersion: 'v1',
    steadyStatus: Object.values(expectStatus.image).flat(),
  },
  // 硬盘
  DiskSidePage: {
    resource: 'disks',
    steadyStatus: {
      status: Object.values(expectStatus.disk).flat(),
      guest_status: [...Object.values(expectStatus.server).flat(), '', undefined],
    },
  },
  // 自动快照策略
  SnapshotPolicySidePage: {
    resource: 'snapshotpolicies',
    steadyStatus: Object.values(expectStatus.snapshotpolicy).flat(),
  },
  // 穿透设备
  GpuSidePage: {
    resource: 'isolated_devices',
    currentTab: 'servers-list',
  },
  // 套餐
  SkuSidePage: {
    resource: 'serverskus',
  },
  // VPC
  VpcSidePage: {
    resource: 'vpcs',
  },
  // IP子网
  NetworkSidePage: {
    resource: 'networks',
  },
  // 二层网络
  WireSidePage: {
    resource: 'wires',
  },
  // 域
  DomainSidePage: {
    resource: 'domains',
    apiVersion: 'v1',
  },
  // 项目
  ProjectSidePage: {
    resource: 'projects',
    apiVersion: 'v1',
  },
  // 组
  GroupSidePage: {
    resource: 'groups',
    apiVersion: 'v1',
  },
  // 物理机
  PhysicalmachineSidePage: {
    resource: 'hosts',
    steadyStatus: {
      status: Object.values(expectStatus.host).flat(),
    },
  },
  // 宿主机
  HostSidePage: {
    resource: 'hosts',
  },
  // 区域
  CloudregionSidePage: {
    resource: 'cloudregions',
  },
  // 可用区域
  ZoneSidePage: {
    resource: 'zones',
  },
  // 云账号
  CloudaccountSidePage: {
    resource: 'cloudaccounts',
  },
  // 认证源
  IDPSidePage: {
    resource: 'identity_providers',
    apiVersion: 'v1',
  },
  // 弹性伸缩组
  ScalingGroupSidePage: {
    resource: 'scalinggroups',
  },
  // 安全组
  SecGroupSidePage: {
    resource: 'secgroups',
  },
  // 代理
  ProxysettingSidePage: {
    resource: 'proxysettings',
  },
  // 权限
  PolicySidePage: {
    resource: 'policies',
    apiVersion: 'v1',
  },
  // 负载均衡
  LbSidePage: {
    resource: 'loadbalancers',
  },
  // 负载均衡-访问控制
  LbaclSidePage: {
    resource: 'loadbalanceracls',
  },
  // 弹性公网IP
  EipSidePage: {
    resource: 'eips',
  },
  // 硬盘快照
  SnapshotSidePage: {
    resource: 'snapshots',
  },
  // RDS实例
  RDSSidePage: {
    resource: 'dbinstances',
  },
  // 权限组
  CloudgroupSidePage: {
    resource: 'cloudgroups',
    apiVersion: 'v1',
  },
  // 云用户
  ClouduserSidePage: {
    resource: 'cloudusers',
    apiVersion: 'v1',
  },
  // 用户
  UserSidePage: {
    resource: 'users',
    apiVersion: 'v1',
  },
  // 权限组缓存
  CloudgroupcacheSidePage: {
    resource: 'cloudgroupcaches',
    apiVersion: 'v1',
  },
  LoadbalancerbackendgroupSidePage: {
    resource: 'loadbalancerbackendgroups',
  },
  LbcertSidePage: {
    resource: 'loadbalancercertificates',
  },
  DnsZoneSidePage: {
    resource: 'dns_zones',
  },
}

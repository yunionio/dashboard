import * as R from 'ramda'

// 平台的配置
export const HYPERVISORS_MAP = {
  // IDC
  kvm: { key: 'kvm', label: 'OneCloud', provider: 'OneCloud', brand: 'OneCloud', host_type: 'kvm', hypervisor: 'kvm' },
  esxi: { key: 'esxi', label: 'VMware', provider: 'VMware', brand: 'VMware', host_type: 'esxi', hypervisor: 'esxi' },
  baremetal: { key: 'baremetal', label: '裸金属服务器', provider: 'OneCloud', brand: 'OneCloud', host_type: 'baremetal', hypervisor: 'baremetal' },
  // Private
  openstack: { key: 'openstack', label: 'OpenStack', provider: 'OpenStack', barnd: 'OpenStack', host_type: 'openstack', hypervisor: 'openstack' },
  zstack: { key: 'zstack', label: 'ZStack', provider: 'ZStack', barnd: 'ZStack', host_type: 'zstack', hypervisor: 'zstack' },
  // Public
  aliyun: { key: 'aliyun', label: '阿里云', provider: 'Aliyun', barnd: 'Aliyun', host_type: 'aliyun', hypervisor: 'aliyun' },
  azure: { key: 'azure', label: 'Azure', provider: 'Azure', barnd: 'Azure', host_type: 'azure', hypervisor: 'azure' },
  aws: { key: 'aws', label: 'AWS', provider: 'Aws', barnd: 'Aws', host_type: 'aws', hypervisor: 'aws' },
  qcloud: { key: 'qcloud', label: '腾讯云', provider: 'Qcloud', barnd: 'Qcloud', host_type: 'qcloud', hypervisor: 'qcloud' },
  huawei: { key: 'huawei', label: '华为云', provider: 'Huawei', barnd: 'Huawei', host_type: 'huawei', hypervisor: 'huawei' },
  ucloud: { key: 'ucloud', label: 'UCloud', provider: 'Ucloud', barnd: 'UCloud', host_type: 'ucloud', hypervisor: 'ucloud' },
}

export const BRAND_MAP = {}
export const PROVIDER_MAP = {}
export const HOST_TYPE_MAP = {}

// 支持 hypervisor、brand、provider、host_type
R.forEachObjIndexed((obj, key) => {
  BRAND_MAP[obj.brand] = {
    ...obj,
    key: obj.brand,
  }
  PROVIDER_MAP[obj.provider] = {
    ...obj,
    key: obj.provider,
  }
  HOST_TYPE_MAP[obj.host_type] = {
    ...obj,
    key: obj.host_type,
  }
}, HYPERVISORS_MAP)

export const HYPERVISORS_GROUP = {
  idc: {
    kvm: HYPERVISORS_MAP.kvm,
    esxi: HYPERVISORS_MAP.esxi,
    baremetal: HYPERVISORS_MAP.baremetal,
  },
  private: {
    openstack: HYPERVISORS_MAP.openstack,
    zstack: HYPERVISORS_MAP.zstack,
  },
  public: {
    aliyun: HYPERVISORS_MAP.aliyun,
    azure: HYPERVISORS_MAP.azure,
    aws: HYPERVISORS_MAP.aws,
    qcloud: HYPERVISORS_MAP.qcloud,
    huawei: HYPERVISORS_MAP.huawei,
    ucloud: HYPERVISORS_MAP.ucloud,
  },
}

// 用户、项目、权限的 scope 类型
export const SCOPES_MAP = {
  system: {
    key: 'system',
    policyLabel: '管理后台',
  },
  domain: {
    key: 'domain',
  },
  project: {
    key: 'project',
    policyLabel: '无管理后台',
  },
}

// 调度策略
export const SCHEDTAG_POLICY_OPTIONS = [
  { key: 'prefer', label: '尽量使用' },
  { key: 'require', label: '必须使用' },
  { key: 'avoid', label: '避免使用' },
  { key: 'exclude', label: '禁止使用' },
]

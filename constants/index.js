import * as R from 'ramda'

// 平台的配置
export const HYPERVISORS_MAP = {
  // IDC
  kvm: { key: 'kvm', label: 'OneCloud', provider: 'OneCloud', brand: 'OneCloud', host_type: 'kvm', hypervisor: 'kvm', env: 'idc', cloud_env: 'onpremise' },
  esxi: { key: 'esxi', label: 'VMware', provider: 'VMware', brand: 'VMware', host_type: 'esxi', hypervisor: 'esxi', env: 'idc', cloud_env: 'onpremise' },
  // Private
  openstack: { key: 'openstack', label: 'OpenStack', provider: 'OpenStack', brand: 'OpenStack', host_type: 'openstack', hypervisor: 'openstack', env: 'private', cloud_env: 'private' },
  dstack: { key: 'dstack', label: 'DStack', provider: 'ZStack', brand: 'DStack', host_type: 'dstack', hypervisor: 'dstack', env: 'private', cloud_env: 'private' },
  zstack: { key: 'zstack', label: 'ZStack', provider: 'ZStack', brand: 'ZStack', host_type: 'zstack', hypervisor: 'zstack', env: 'private', cloud_env: 'private' },
  // Public
  aliyun: { key: 'aliyun', label: '阿里云', provider: 'Aliyun', brand: 'Aliyun', host_type: 'aliyun', hypervisor: 'aliyun', env: 'public', cloud_env: 'public' },
  azure: { key: 'azure', label: 'Azure', provider: 'Azure', brand: 'Azure', host_type: 'azure', hypervisor: 'azure', env: 'public', cloud_env: 'public' },
  aws: { key: 'aws', label: 'AWS', provider: 'Aws', brand: 'Aws', host_type: 'aws', hypervisor: 'aws', env: 'public', cloud_env: 'public' },
  qcloud: { key: 'qcloud', label: '腾讯云', provider: 'Qcloud', brand: 'Qcloud', host_type: 'qcloud', hypervisor: 'qcloud', env: 'public', cloud_env: 'public' },
  huawei: { key: 'huawei', label: '华为云', provider: 'Huawei', brand: 'Huawei', host_type: 'huawei', hypervisor: 'huawei', env: 'public', cloud_env: 'public' },
  ucloud: { key: 'ucloud', label: 'UCloud', provider: 'Ucloud', brand: 'Ucloud', host_type: 'ucloud', hypervisor: 'ucloud', env: 'public', cloud_env: 'public' },
  google: { key: 'google', label: 'Google', provider: 'Google', brand: 'Google', host_type: 'google', hypervisor: 'google', env: 'public', cloud_env: 'public' },
  ctyun: { key: 'ctyun', label: '天翼云', provider: 'Ctyun', brand: 'Ctyun', host_type: 'ctyun', hypervisor: 'ctyun', env: 'public', cloud_env: 'public' },
}

export const EXTRA_HYPERVISORS = {
  s3: { key: 's3', label: 'S3', provider: 'S3', brand: 'S3', host_type: 's3', hypervisor: 's3', env: 'idc', cloud_env: 'onpremise' },
  ceph: { key: 'ceph', label: 'Ceph', provider: 'Ceph', brand: 'Ceph', host_type: 'ceph', hypervisor: 'ceph', env: 'idc', cloud_env: 'onpremise' },
  xsky: { key: 'xsky', label: 'XSKY', provider: 'Xsky', brand: 'Xsky', host_type: 'xsky', hypervisor: 'xsky', env: 'idc', cloud_env: 'onpremise' },
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

export const ENABLED_OPTS = [
  { key: true, label: '启用' },
  { key: false, label: '禁用' },
]

export const CITYS = {
  'Shanghai': '上海',
  'Beijing': '北京',
  'Guangzhou': '广州',
  'Hongkong': '香港',
  'Chengdu': '成都',
  'Hangzhou': '杭州',
  'Ningxia': '宁夏',
  'Shenzhen': '深圳',
  'Zhangjiakou': '张家口',
  'Bangkok': '曼谷',
  'Guiyang': '贵阳',
  'Pretoria': '比勒陀利亚 南非',
  'Cape Town': '开普敦 南非',
  'Yarralumla': '亚拉伦拉 澳大利亚',
  'Busan': '釜山 韩国',
  'Toronto': '加拿大 多伦多',
  'Dublin': '都柏林 爱尔兰',
  'Allier': '阿利埃河 法国',
  'San Francisco': '旧金山 美国',
  'Osaka': '大阪市 日本',
  'Tarn': '塔恩 法国',
  'Virginia': '美国 弗吉尼亚',
  'Mumbai': '印度 孟买',
  'Utah': '美国 犹他州',
  'Singapore': '新加坡',
  'Tokyo': '日本 东京',
  'Halton': '英国 哈尔顿',
  'Melbourne': '澳大利亚 墨尔本',
  'West Sussex': '英国 西苏塞克斯',
  'Washington': '美国 华盛顿',
  'Texas': '美国 德克萨斯',
  'Sao Paulo': '巴西 圣保罗',
  'Seoul': '韩国 汉城',
  'Maharashtra': '印度 马哈拉施特拉邦',
  'Chicago': '美国 芝加哥',
  'Iowa': '美国 爱荷华',
  'Sydney': '澳大利亚 悉尼',
  'Holland': '荷兰',
  'Quebec': '加拿大 魁北克市',
  'Kanchipuram': '印度 甘吉布勒姆',
  'Huhehaote': '呼和浩特',
  'Qingdao': '青岛',
  'Chongqing': '重庆',
}

export const CLOUD_PROVIDERS_MAP = {
  'Aliyun': '阿里云',
  'Aws': 'AWS',
  'Huawei': '华为云',
  'Qcloud': '腾讯云',
  'Azure': '微软云',
}

// 共享范围
export const SHARE_SCOPE = {
  system: { key: 'system', label: '系统' },
  domain: { key: 'domain', label: '域' },
  project: { key: 'project', label: '项目' },
}

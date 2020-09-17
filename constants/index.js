import * as R from 'ramda'
import { skuCategoryOptions } from '@/locales/zh-CN'
import { HYPERVISORS_MAP } from '@/constants'

export const CreateServerForm = {
  labelCol: 3,
  wrapperCol: 20,
}

// 创建主机的类型
export const SERVER_TYPE = {
  private: 'private',
  public: 'public',
  baremetal: 'baremetal',
  idc: 'idc',
}

// 网络配置选项
export const NETWORK_OPTIONS_MAP = {
  default: {
    label: '默认',
    key: 'default',
  },
  manual: {
    label: '指定IP子网',
    key: 'manual',
  },
  schedtag: {
    label: '指定调度标签',
    key: 'schedtag',
  },
}

// 根据创建类型不同，定义某些 API 请求的默认 params
export const DEFAULT_PARAMS = {
  [SERVER_TYPE.idc]: {
    network: { // IP子网
      scope: '',
      filter: 'server_type.notin(ipmi, pxe)',
      usable: true,
    },
    image: {
      limit: 0,
      scope: '',
      details: true,
      status: 'active',
    },
    cloudregion: { // 区域
      cloud_env: 'onpremise',
      usable: true,
      show_emulated: true,
    },
    zone: {}, // 可用区
    capability: {
      resource_type: 'share',
      show_emulated: true,
    },
    schedtag: { // 网络调度标签
      resource_type: 'networks',
    },
    sku: {
      limit: 0,
      public_cloud: false,
      postpaid_status: 'available',
    },
    policySchedtag: { // 调度策略：指定调度标签
      limit: 0,
      'filter.0': 'resource_type.equals(hosts)',
    },
  },
  [SERVER_TYPE.private]: {
    cloudRegionList: {
      cloud_env: 'private',
    },
    capability: {
      resource_type: 'share',
    },
    skuList: {
      public_cloud: false,
    },
  },
  [SERVER_TYPE.public]: {
    image: {
      limit: 0,
      scope: '',
      details: true,
      status: 'active',
    },
    cloudRegionList: {
      cloud_env: 'public',
    },
    cloudRegionZoneList: {
      cloud_env: 'public',
    },
    capability: {
      resource_type: 'share',
    },
    skuList: {
      public_cloud: true,
      postpaid_status: 'available',
    },
    hostList: {
      show_emulated: true,
      resource_type: 'shared',
    },
    instanceSpecs: {
      public_cloud: true,
      postpaid_status: 'available',
    },
  },
  [SERVER_TYPE.baremetal]: {
    cloudRegionList: {
      cloud_env: 'onpremise',
    },
    capability: {
      resource_type: 'share',
    },
    skuList: {
      public_cloud: false,
    },
  },
}

// 套餐全部的配置。这个配置则是对应key value配置
export const ALL_SKU_CATEGORY_OPT = {
  key: 'all',
  label: '全部',
}

// 套餐类型
export const SKU_CATEGORY_MAP = R.map(item => Object.keys(item), skuCategoryOptions)

// 自动选择的存储类型
export const STORAGE_AUTO = {
  label: '自动选择',
  key: 'auto',
  min: 10,
  max: 3 * 1024,
  sysMin: 20,
  sysMax: 500,
}

// GPU 块数选择配置
export const GPU_COUNT_OPTIONS = [
  { label: '1块', key: 1 },
  { label: '2块', key: 2 },
  { label: '3块', key: 3 },
  { label: '4块', key: 4 },
  { label: '5块', key: 5 },
  { label: '6块', key: 6 },
  { label: '7块', key: 7 },
  { label: '8块', key: 8 },
]

// 调度策略配置选项
export const SCHED_POLICY_OPTIONS_MAP = {
  default: {
    label: '默认',
    key: 'default',
  },
  host: {
    label: {
      [SERVER_TYPE.idc]: '指定宿主机',
      [SERVER_TYPE.private]: '指定宿主机',
      [SERVER_TYPE.public]: '指定云订阅',
      [SERVER_TYPE.baremetal]: '指定物理机',
    },
    key: 'host',
  },
  cloudprovider: {
    label: '指定云订阅',
    key: 'cloudprovider',
  },
  schedtag: {
    label: '指定调度标签',
    key: 'schedtag',
  },
}

// 弹性IP配置选项
export const EIP_TYPES_MAP = {
  none: {
    label: '暂不需要',
    key: 'none',
  },
  new: {
    label: '新建',
    key: 'new',
  },
  bind: {
    label: '绑定已有',
    key: 'bind',
  },
}

// 新建弹性IP配置选项
export const EIP_CHARGE_TYPES_MAP = {
  traffic: {
    label: '按流量计费',
    key: 'traffic',
  },
  bandwidth: {
    label: '按固定带宽',
    key: 'bandwidth',
  },
}

// 弹性IP设置范围
export const EIP_RANGES_MAP = {
  default: {
    [EIP_CHARGE_TYPES_MAP.traffic.key]: {
      min: 1,
      max: 200,
    },
    [EIP_CHARGE_TYPES_MAP.bandwidth.key]: {
      min: 1,
      max: 200,
    },
  },
  [HYPERVISORS_MAP.aliyun.key]: {
    [EIP_CHARGE_TYPES_MAP.traffic.key]: {
      min: 1,
      max: 200,
    },
    [EIP_CHARGE_TYPES_MAP.bandwidth.key]: {
      min: 1,
      max: 500,
    },
  },
  [HYPERVISORS_MAP.aws.key]: {
    [EIP_CHARGE_TYPES_MAP.traffic.key]: {
      min: 1,
      max: 200,
    },
    [EIP_CHARGE_TYPES_MAP.bandwidth.key]: {
      min: 1,
      max: 200,
    },
  },
  [HYPERVISORS_MAP.qcloud.key]: {
    [EIP_CHARGE_TYPES_MAP.traffic.key]: {
      min: 1,
      max: 200,
    },
    [EIP_CHARGE_TYPES_MAP.bandwidth.key]: {
      min: 1,
      max: 200,
    },
  },
  [HYPERVISORS_MAP.azure.key]: {
    [EIP_CHARGE_TYPES_MAP.traffic.key]: {
      min: 1,
      max: 200,
    },
    [EIP_CHARGE_TYPES_MAP.bandwidth.key]: {
      min: 1,
      max: 200,
    },
  },
  [HYPERVISORS_MAP.huawei.key]: {
    [EIP_CHARGE_TYPES_MAP.traffic.key]: {
      min: 1,
      max: 300,
    },
    [EIP_CHARGE_TYPES_MAP.bandwidth.key]: {
      min: 1,
      max: 2000,
      stopsArr: [1000],
    },
  },
  [HYPERVISORS_MAP.ucloud.key]: {
    [EIP_CHARGE_TYPES_MAP.traffic.key]: {
      min: 1,
      max: 300,
    },
    [EIP_CHARGE_TYPES_MAP.bandwidth.key]: {
      min: 1,
      max: 800,
      stopsArr: [400],
    },
  },
}

// 公有云计费方式配置选项
export const BILL_TYPES_MAP = {
  quantity: {
    label: '按量付费',
    key: 'quantity',
  },
  package: {
    label: '包年包月',
    key: 'package',
  },
}

// 包年包月购买时长选项配置
export const BUY_DURATION_OPTIONS = [
  {
    label: '1周',
    key: '1W',
    unit: 'W',
    includes: [HYPERVISORS_MAP.aliyun.key], // 仅阿里云支持
  },
  {
    label: '1个月',
    key: '1M',
    unit: 'M',
  },
  {
    label: '2个月',
    key: '2M',
    unit: 'M',
  },
  {
    label: '3个月',
    key: '3M',
    unit: 'M',
  },
  {
    label: '半年',
    key: '6M',
    unit: 'M',
  },
  {
    label: '1年',
    key: '1Y',
    unit: 'Y',
  },
  {
    label: '2年',
    key: '2Y',
    unit: 'Y',
  },
  {
    label: '3年',
    key: '3Y',
    unit: 'Y',
  },
]

// 管理员密码选择配置
export const LOGIN_TYPES_MAP = {
  random: {
    label: '随机生成',
    key: 'random',
  },
  keypair: {
    label: '关联密钥',
    key: 'keypair',
  },
  image: {
    label: '保留镜像设置',
    key: 'image',
  },
  password: {
    label: '手工输入',
    key: 'password',
  },
}

// 安全组配置选项
export const SECGROUP_OPTIONS_MAP = {
  none: {
    key: 'default',
    label: '默认',
  },
  bind: {
    key: 'bind',
    label: '指定安全组',
  },
}

// 创建预测错误过滤类型映射表
export const FORECAST_FILTERS_MAP = {
  host_cpu: '宿主机 cpu 空闲个数不满足请求个数',
  host_isolated_device: '宿主机 gpu 空闲个数不满足请求个数',
  host_memory: '宿主机空闲内存不满足请求数量',
  host_network: '网络剩余 ip 数量不满足',
  host_storage: '宿主机磁盘不足',
  host_status: '宿主机状态异常',
  host_aggregate: '宿主机被标签过滤',
  disk_schedtag: '磁盘被标签过滤',
}

// 资源池配置选项
export const RESOURCE_TYPES_MAP = {
  shared: {
    label: '通用资源池',
    key: 'shared',
  },
  prepaid: {
    label: '预付费资源池',
    key: 'prepaid',
  },
}

// 介质过滤类型映射表
export const MEDIUM_MAP = {
  rotate: '机械盘',
  ssd: '固态硬盘',
}

export const DISK_TYPES = {
  sys: '系统盘',
  data: '数据盘',
  'swap-swap': '分区',
}

// 支持自定义的存储类型
export const CUSTOM_STORAGE_TYPES = ['openstack', 'kvm']
// 公有云存储类型 + 私有云存储类型
export const STORAGE_TYPES = {
  aliyun: {
    cloud: {
      label: '普通云盘',
      value: 'cloud',
      min: 5, // 数据盘或者新建云硬盘的取值范围【G】
      max: 2000, // 数据盘或者新建云硬盘的取值范围【G】
      sysMin: 20, // 系统盘取值范围【G】
      sysMax: 500, // 系统盘取值范围【G】
    },
    cloud_ssd: {
      label: 'SSD 云盘',
      value: 'cloud_ssd',
      min: 20,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd: {
      label: 'ESSD云盘PL1',
      value: 'cloud_essd',
      min: 20,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd_pl2: {
      label: 'ESSD云盘PL2',
      value: 'cloud_essd_pl2',
      min: 461,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd_pl3: {
      label: 'ESSD云盘PL3',
      value: 'cloud_essd_pl3',
      min: 1261,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_efficiency: {
      label: '高效云盘',
      value: 'cloud_efficiency',
      min: 20,
      max: 32768,
      default: true,
      sysMin: 20,
      sysMax: 500,
    },
    ephemeral_ssd: {
      label: '本地 SSD 盘',
      value: 'ephemeral_ssd',
      min: 5,
      max: 800,
      sysMin: 20,
      sysMax: 500,
    },
  },
  aws: {
    gp2: {
      label: '通用型 SSD',
      value: 'gp2',
      min: 1,
      max: 16384,
      default: true,
      sysMin: 1,
      sysMax: 16384,
    },
    io1: {
      label: '预配置 IOPS SSD',
      value: 'io1',
      min: 4,
      max: 16384,
      sysMin: 1,
      sysMax: 16384,
    },
    st1: {
      label: '吞吐优化 HDD',
      value: 'st1',
      sysUnusable: true, // 系统盘不可用
      min: 500,
      max: 16384,
    },
    sc1: {
      label: 'Cold HDD',
      value: 'sc1',
      sysUnusable: true, // 系统盘不可用
      min: 500,
      max: 16384,
    },
    standard: {
      label: '磁介质',
      value: 'standard',
      min: 1,
      max: 1024,
      sysMin: 1,
      sysMax: 16384,
    },
  },
  qcloud: {
    local_basic: { // 公有云下架了这两款磁盘类型
      label: '普通本地盘',
      value: 'local_basic',
      min: 10,
      max: 1600,
      sysUnusable: true, // 系统盘不可用
      resizeStep: 10, // 扩容步长，默认值是 1 G
      unCreateCloud: true, // 不支持创建云硬盘
    },
    cloud_basic: {
      label: '普通云硬盘',
      value: 'cloud_basic',
      min: 10,
      max: 16000,
      default: true,
      sysMin: 50,
      sysMax: 500,
      resizeStep: 10,
    },
    cloud_premium: {
      label: '高性能云硬盘',
      value: 'cloud_premium',
      min: 50,
      max: 16000,
      sysMin: 50,
      sysMax: 1024,
      resizeStep: 10,
    },
    cloud_ssd: {
      label: 'SSD 云硬盘',
      value: 'cloud_ssd',
      min: 100,
      max: 16000,
      sysMin: 50,
      sysMax: 500,
      resizeStep: 10,
    },
    cloud_hssd: {
      label: '增强型SSD云硬盘',
      value: 'cloud_hssd',
      min: 100,
      max: 16000,
      sysMin: 50,
      sysMax: 500,
      resizeStep: 10,
    },
  },
  azure: {
    standard_lrs: {
      label: '标准 HDD',
      value: 'standard_lrs',
      min: 1,
      max: 4095,
      default: true,
      sysMin: 30,
      sysMax: 4095,
    },
    standardssd_lrs: {
      label: '标准 SSD',
      value: 'standardssd_lrs',
      min: 1,
      max: 4095,
      sysMin: 30,
      sysMax: 4095,
    },
    premium_lrs: {
      label: '高级 SSD',
      value: 'premium_lrs',
      min: 1,
      max: 4095,
      sysMin: 30,
      sysMax: 4095,
    },
  },
  kvm: {
    local: {
      label: '本地硬盘',
      value: 'local',
      min: 1,
      max: 3 * 1024, // 鹏博士需求，数据盘上限扩大到 3T
      default: true,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    nfs: {
      label: 'NFS',
      value: 'nfs',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    gpfs: {
      label: 'GPFS',
      value: 'gpfs',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
    },
    rbd: {
      label: 'Ceph RBD',
      value: 'rbd',
      min: 1,
      max: 3072,
      sysMin: 10,
      sysMax: 500,
    },
  },
  onecloud: {
    local: {
      label: '本地硬盘',
      value: 'local',
      min: 1,
      max: 3 * 1024, // 鹏博士需求，数据盘上限扩大到 3T
      default: true,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    nfs: {
      label: 'NFS',
      value: 'nfs',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    gpfs: {
      label: 'GPFS',
      value: 'gpfs',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
    },
    rbd: {
      label: 'rbd',
      value: 'rbd',
      min: 1,
      max: 3072,
      sysMin: 10,
      sysMax: 500,
    },
  },
  esxi: {
    local: {
      label: '本地硬盘',
      value: 'local',
      min: 1,
      // max: 500,
      max: 3 * 1024, // 鹏博士需求，数据盘上限扩大到 3T
      default: true,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    nas: {
      label: 'nas 云盘',
      value: 'nas',
      min: 1,
      max: 3072,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    vsan: {
      label: 'vsan 云盘',
      value: 'vsan',
      min: 1,
      max: 3072,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
  },
  huawei: {
    SSD: {
      label: '超高IO云硬盘',
      value: 'SSD',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 3,
    },
    SAS: {
      label: '高IO云硬盘',
      value: 'SAS',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 2,
    },
    SATA: {
      label: '普通IO云硬盘',
      value: 'SATA',
      min: 10,
      max: 32768,
      default: true,
      sysMin: 20,
      sysMax: 1024,
      sort: 1,
    },
  },
  openstack: {
    iscsi: {
      label: 'iscsi',
      value: 'iscsi',
      min: 1,
      max: 500,
      sysMin: 10,
      sysMax: 500,
    },
  },
  ucloud: {
    CLOUD_NORMAL: {
      label: '普通云盘',
      value: 'CLOUD_NORMAL',
      min: 20,
      max: 8000,
      sysUnusable: true, // 系统盘不可用
      skuFamily: ['N2', 'N3'],
    },
    CLOUD_SSD: {
      label: 'SSD云盘',
      value: 'CLOUD_SSD',
      min: 20,
      max: 4000,
      sysMin: 20,
      sysMax: 500,
      skuFamily: ['N3', 'C1', 'N2', 'I2', 'G2', 'G3'],
    },
    EXCLUSIVE_LOCAL_DISK: {
      label: '独享本地盘',
      value: 'EXCLUSIVE_LOCAL_DISK',
      min: 4096,
      max: 4096,
      sysUnusable: true, // 系统盘不可用
      skuFamily: ['D1'],
    },
  },
  zstack: {
    localstorage: {
      label: '本地盘',
      value: 'localstorage',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
    },
    ceph: {
      label: '共享云盘',
      value: 'ceph',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
    },
  },
  ctyun: {
    SSD: {
      label: '超高IO云硬盘',
      value: 'SSD',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 3,
    },
    SAS: {
      label: '高IO云硬盘',
      value: 'SAS',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 2,
    },
    SATA: {
      label: '普通IO云硬盘',
      value: 'SATA',
      min: 10,
      max: 32768,
      default: true,
      sysMin: 20,
      sysMax: 1024,
      sort: 1,
    },
  },
  google: {
    'pd-ssd': {
      label: 'SSD永久性磁盘',
      value: 'pd-ssd',
      min: 10,
      max: 65536,
      sysMin: 10,
      sysMax: 65536,
      sort: 1,
    },
    'pd-standard': {
      label: '标准永久性磁盘',
      value: 'pd-standard',
      min: 10,
      max: 65536,
      sysMin: 10,
      sysMax: 65536,
      sort: 2,
    },
    'local-ssd': {
      label: '本地SSD',
      value: 'local-ssd',
      min: 375,
      max: 375,
      sysMin: 375,
      sysMax: 375,
      sort: 3,
    },
  },
}
export const ALL_STORAGE = {}
export const ALL_STORAGE_LABEL = {}
Object.keys(STORAGE_TYPES).forEach(hypervisor => {
  Object.assign(ALL_STORAGE, STORAGE_TYPES[hypervisor])
})

Object.keys(ALL_STORAGE).forEach(sType => {
  ALL_STORAGE_LABEL[sType] = ALL_STORAGE[sType].label
})

export const weekOptions = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']

export const timeOptions = [
  '00:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
]

// 磁盘类型
export const DISK_TYPE = {
  data: {
    value: 'data',
    text: '数据盘',
  },
  sys: {
    value: 'sys',
    text: '系统盘',
  },
}

// 购买时长
export const BUY_DURATIONS_OPTIONS = [
  {
    label: '1个月',
    value: '1M',
    unit: 'M',
  },
  {
    label: '2个月',
    value: '2M',
    unit: 'M',
  },
  {
    label: '3个月',
    value: '3M',
    unit: 'M',
  },
  {
    label: '半年',
    value: '6M',
    unit: 'M',
  },
  {
    label: '1年',
    value: '1Y',
    unit: 'Y',
  },
  {
    label: '2年',
    value: '2Y',
    unit: 'Y',
  },
  {
    label: '3年',
    value: '3Y',
    unit: 'Y',
  },
]

// 记录创建成功后选择的镜像，存储cookie的key suffix
export const SELECT_IMAGE_KEY_SUFFIX = '__select_image'

import * as R from 'ramda'
import { skuCategoryOptions } from '@/locales/zh-CN'
import { HYPERVISORS_MAP } from '@/constants'
import i18n from '@/locales'

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
    label: i18n.t('common_563'),
    key: 'default',
  },
  manual: {
    label: i18n.t('compute.text_2'),
    key: 'manual',
  },
  schedtag: {
    label: i18n.t('compute.text_3'),
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
  label: i18n.t('compute.text_4'),
}

// 套餐类型
export const SKU_CATEGORY_MAP = R.map(item => Object.keys(item), skuCategoryOptions)

// 自动选择的存储类型
export const STORAGE_AUTO = {
  label: i18n.t('compute.text_5'),
  key: 'auto',
  min: 10,
  max: 3 * 1024,
  sysMin: 20,
  sysMax: 500,
}

// GPU 块数选择配置
export const GPU_COUNT_OPTIONS = [
  { label: i18n.t('compute.text_6'), key: 1 },
  { label: i18n.t('compute.text_7'), key: 2 },
  { label: i18n.t('compute.text_8'), key: 3 },
  { label: i18n.t('compute.text_9'), key: 4 },
  { label: i18n.t('compute.text_10'), key: 5 },
  { label: i18n.t('compute.text_11'), key: 6 },
  { label: i18n.t('compute.text_12'), key: 7 },
  { label: i18n.t('compute.text_13'), key: 8 },
]

// 调度策略配置选项
export const SCHED_POLICY_OPTIONS_MAP = {
  default: {
    label: i18n.t('compute.text_1'),
    key: 'default',
  },
  host: {
    label: {
      [SERVER_TYPE.idc]: i18n.t('compute.text_14'),
      [SERVER_TYPE.private]: i18n.t('compute.text_14'),
      [SERVER_TYPE.public]: i18n.t('compute.text_15'),
      [SERVER_TYPE.baremetal]: i18n.t('compute.text_16'),
    },
    key: 'host',
  },
  cloudprovider: {
    label: i18n.t('compute.text_15'),
    key: 'cloudprovider',
  },
  schedtag: {
    label: i18n.t('compute.text_3'),
    key: 'schedtag',
  },
}

// 弹性IP配置选项
export const EIP_TYPES_MAP = {
  none: {
    label: i18n.t('compute.text_17'),
    key: 'none',
  },
  new: {
    label: i18n.t('compute.text_18'),
    key: 'new',
  },
  bind: {
    label: i18n.t('compute.text_19'),
    key: 'bind',
  },
}

// 新建弹性IP配置选项
export const EIP_CHARGE_TYPES_MAP = {
  traffic: {
    label: i18n.t('compute.text_20'),
    key: 'traffic',
  },
  bandwidth: {
    label: i18n.t('compute.text_21'),
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
    label: i18n.t('compute.text_22'),
    key: 'quantity',
  },
  package: {
    label: i18n.t('compute.text_23'),
    key: 'package',
  },
}

// 包年包月购买时长选项配置
export const BUY_DURATION_OPTIONS = [
  {
    label: i18n.t('compute.text_24'),
    key: '1W',
    unit: 'W',
    includes: [HYPERVISORS_MAP.aliyun.key], // 仅阿里云支持
  },
  {
    label: i18n.t('compute.text_25'),
    key: '1M',
    unit: 'M',
  },
  {
    label: i18n.t('compute.text_26'),
    key: '2M',
    unit: 'M',
  },
  {
    label: i18n.t('compute.text_27'),
    key: '3M',
    unit: 'M',
  },
  {
    label: i18n.t('compute.text_28'),
    key: '6M',
    unit: 'M',
  },
  {
    label: i18n.t('compute.text_29'),
    key: '1Y',
    unit: 'Y',
  },
  {
    label: i18n.t('compute.text_30'),
    key: '2Y',
    unit: 'Y',
  },
  {
    label: i18n.t('compute.text_31'),
    key: '3Y',
    unit: 'Y',
  },
]

// 管理员密码选择配置
export const LOGIN_TYPES_MAP = {
  random: {
    label: i18n.t('compute.text_32'),
    key: 'random',
  },
  keypair: {
    label: i18n.t('compute.text_33'),
    key: 'keypair',
  },
  image: {
    label: i18n.t('compute.text_34'),
    key: 'image',
  },
  password: {
    label: i18n.t('compute.text_35'),
    key: 'password',
  },
}

// 安全组配置选项
export const SECGROUP_OPTIONS_MAP = {
  none: {
    key: 'default',
    label: i18n.t('compute.text_1'),
  },
  bind: {
    key: 'bind',
    label: i18n.t('compute.text_36'),
  },
}

// 创建预测错误过滤类型映射表
export const FORECAST_FILTERS_MAP = {
  host_cpu: i18n.t('compute.text_37'),
  host_isolated_device: i18n.t('compute.text_38'),
  host_memory: i18n.t('compute.text_39'),
  host_network: i18n.t('compute.text_40'),
  host_storage: i18n.t('compute.text_41'),
  host_status: i18n.t('compute.text_42'),
  host_aggregate: i18n.t('compute.text_43'),
  disk_schedtag: i18n.t('compute.text_44'),
}

// 资源池配置选项
export const RESOURCE_TYPES_MAP = {
  shared: {
    label: i18n.t('compute.text_45'),
    key: 'shared',
  },
  prepaid: {
    label: i18n.t('compute.text_46'),
    key: 'prepaid',
  },
}

// 介质过滤类型映射表
export const MEDIUM_MAP = {
  rotate: i18n.t('compute.text_47'),
  ssd: i18n.t('compute.text_48'),
}

export const DISK_TYPES = {
  sys: i18n.t('compute.text_49'),
  data: i18n.t('compute.text_50'),
  'swap-swap': i18n.t('compute.text_51'),
}

// 支持自定义的存储类型
export const CUSTOM_STORAGE_TYPES = ['openstack', 'kvm']
// 公有云存储类型 + 私有云存储类型
export const STORAGE_TYPES = {
  aliyun: {
    cloud: {
      label: i18n.t('compute.text_52'),
      value: 'cloud',
      min: 5, // 数据盘或者新建云硬盘的取值范围【G】
      max: 2000, // 数据盘或者新建云硬盘的取值范围【G】
      sysMin: 20, // 系统盘取值范围【G】
      sysMax: 500, // 系统盘取值范围【G】
    },
    cloud_ssd: {
      label: i18n.t('compute.text_53'),
      value: 'cloud_ssd',
      min: 20,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd: {
      label: i18n.t('compute.text_54'),
      value: 'cloud_essd',
      min: 20,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd_pl2: {
      label: i18n.t('compute.text_55'),
      value: 'cloud_essd_pl2',
      min: 461,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd_pl3: {
      label: i18n.t('compute.text_56'),
      value: 'cloud_essd_pl3',
      min: 1261,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_efficiency: {
      label: i18n.t('compute.text_57'),
      value: 'cloud_efficiency',
      min: 20,
      max: 32768,
      default: true,
      sysMin: 20,
      sysMax: 500,
    },
    ephemeral_ssd: {
      label: i18n.t('compute.text_58'),
      value: 'ephemeral_ssd',
      min: 5,
      max: 800,
      sysMin: 20,
      sysMax: 500,
    },
  },
  aws: {
    gp2: {
      label: i18n.t('compute.text_59'),
      value: 'gp2',
      min: 1,
      max: 16384,
      default: true,
      sysMin: 1,
      sysMax: 16384,
    },
    io1: {
      label: i18n.t('compute.text_60'),
      value: 'io1',
      min: 4,
      max: 16384,
      sysMin: 1,
      sysMax: 16384,
    },
    st1: {
      label: i18n.t('compute.text_61'),
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
      label: i18n.t('compute.text_62'),
      value: 'standard',
      min: 1,
      max: 1024,
      sysMin: 1,
      sysMax: 16384,
    },
  },
  qcloud: {
    local_basic: { // 公有云下架了这两款磁盘类型
      label: i18n.t('compute.text_63'),
      value: 'local_basic',
      min: 10,
      max: 1600,
      sysUnusable: true, // 系统盘不可用
      resizeStep: 10, // 扩容步长，默认值是 1 G
      unCreateCloud: true, // 不支持创建云硬盘
    },
    cloud_basic: {
      label: i18n.t('compute.text_64'),
      value: 'cloud_basic',
      min: 10,
      max: 16000,
      default: true,
      sysMin: 50,
      sysMax: 500,
      resizeStep: 10,
    },
    cloud_premium: {
      label: i18n.t('compute.text_65'),
      value: 'cloud_premium',
      min: 50,
      max: 16000,
      sysMin: 50,
      sysMax: 1024,
      resizeStep: 10,
    },
    cloud_ssd: {
      label: i18n.t('compute.text_66'),
      value: 'cloud_ssd',
      min: 100,
      max: 16000,
      sysMin: 50,
      sysMax: 500,
      resizeStep: 10,
    },
  },
  azure: {
    standard_lrs: {
      label: i18n.t('compute.text_67'),
      value: 'standard_lrs',
      min: 1,
      max: 4095,
      default: true,
      sysMin: 30,
      sysMax: 4095,
    },
    standardssd_lrs: {
      label: i18n.t('compute.text_68'),
      value: 'standardssd_lrs',
      min: 1,
      max: 4095,
      sysMin: 30,
      sysMax: 4095,
    },
    premium_lrs: {
      label: i18n.t('compute.text_69'),
      value: 'premium_lrs',
      min: 1,
      max: 4095,
      sysMin: 30,
      sysMax: 4095,
    },
  },
  kvm: {
    local: {
      label: i18n.t('compute.text_70'),
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
      label: i18n.t('compute.text_70'),
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
      label: i18n.t('compute.text_70'),
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
      label: i18n.t('compute.text_71'),
      value: 'nas',
      min: 1,
      max: 3072,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    vsan: {
      label: i18n.t('compute.text_72'),
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
      label: i18n.t('compute.text_73'),
      value: 'SSD',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 3,
    },
    SAS: {
      label: i18n.t('compute.text_74'),
      value: 'SAS',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 2,
    },
    SATA: {
      label: i18n.t('compute.text_75'),
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
      label: i18n.t('compute.text_52'),
      value: 'CLOUD_NORMAL',
      min: 20,
      max: 8000,
      sysUnusable: true, // 系统盘不可用
      skuFamily: ['N2', 'N3'],
    },
    CLOUD_SSD: {
      label: i18n.t('compute.text_76'),
      value: 'CLOUD_SSD',
      min: 20,
      max: 4000,
      sysMin: 20,
      sysMax: 500,
      skuFamily: ['N3', 'C1', 'N2', 'I2', 'G2', 'G3'],
    },
    EXCLUSIVE_LOCAL_DISK: {
      label: i18n.t('compute.text_77'),
      value: 'EXCLUSIVE_LOCAL_DISK',
      min: 4096,
      max: 4096,
      sysUnusable: true, // 系统盘不可用
      skuFamily: ['D1'],
    },
  },
  zstack: {
    localstorage: {
      label: i18n.t('compute.text_78'),
      value: 'localstorage',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
    },
    ceph: {
      label: i18n.t('compute.text_79'),
      value: 'ceph',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
    },
  },
  ctyun: {
    SSD: {
      label: i18n.t('compute.text_73'),
      value: 'SSD',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 3,
    },
    SAS: {
      label: i18n.t('compute.text_74'),
      value: 'SAS',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 2,
    },
    SATA: {
      label: i18n.t('compute.text_75'),
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
      label: i18n.t('compute.text_80'),
      value: 'pd-ssd',
      min: 10,
      max: 65536,
      sysMin: 10,
      sysMax: 65536,
      sort: 1,
    },
    'pd-standard': {
      label: i18n.t('compute.text_81'),
      value: 'pd-standard',
      min: 10,
      max: 65536,
      sysMin: 10,
      sysMax: 65536,
      sort: 2,
    },
    'local-ssd': {
      label: i18n.t('compute.text_82'),
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

export const weekOptions = [i18n.t('compute.text_83'), i18n.t('compute.text_84'), i18n.t('compute.text_85'), i18n.t('compute.text_86'), i18n.t('compute.text_87'), i18n.t('compute.text_88'), i18n.t('compute.text_89')]

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
    text: i18n.t('compute.text_50'),
  },
  sys: {
    value: 'sys',
    text: i18n.t('compute.text_49'),
  },
}

// 购买时长
export const BUY_DURATIONS_OPTIONS = [
  {
    label: i18n.t('compute.text_25'),
    value: '1M',
    unit: 'M',
  },
  {
    label: i18n.t('compute.text_26'),
    value: '2M',
    unit: 'M',
  },
  {
    label: i18n.t('compute.text_27'),
    value: '3M',
    unit: 'M',
  },
  {
    label: i18n.t('compute.text_28'),
    value: '6M',
    unit: 'M',
  },
  {
    label: i18n.t('compute.text_29'),
    value: '1Y',
    unit: 'Y',
  },
  {
    label: i18n.t('compute.text_30'),
    value: '2Y',
    unit: 'Y',
  },
  {
    label: i18n.t('compute.text_31'),
    value: '3Y',
    unit: 'Y',
  },
]

// 记录创建成功后选择的镜像，存储cookie的key suffix
export const SELECT_IMAGE_KEY_SUFFIX = '__select_image'

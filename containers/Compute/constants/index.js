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
      'filter.0': 'disk_format.notequals(iso)',
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
      [SERVER_TYPE.public]: '指定云账号',
      [SERVER_TYPE.baremetal]: '指定宿主机',
    },
    key: 'host',
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
  default: {
    label: '默认',
    key: 'default',
  },
  manual: {
    label: '指定安全组',
    key: 'manual',
  },
}

// 创建预测错误过滤类型映射表
export const FORECAST_FILTERS_MAP = {
  'host_cpu': '宿主机 cpu 空闲个数不满足请求个数',
  'host_isolated_device': '宿主机 gpu 空闲个数不满足请求个数',
  'host_memory': '宿主机空闲内存不满足请求数量',
  'host_network': '网络剩余 ip 数量不满足',
  'host_storage': '宿主机磁盘不足',
  'host_status': '宿主机状态异常',
  'host_aggregate': '宿主机被标签过滤',
  'disk_schedtag': '磁盘被标签过滤',
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

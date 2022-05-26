import * as R from 'ramda'
import i18n from '@/locales'
import { arrayToObj } from '@/utils/utils'

// 平台的配置
export const HYPERVISORS = [
  // IDC
  { key: 'kvm', label: i18n.t('brand'), provider: 'OneCloud', brand: 'OneCloud', host_type: 'kvm', hypervisor: 'kvm', env: 'idc', cloud_env: 'onpremise' },
  { key: 'esxi', label: 'VMware', provider: 'VMware', brand: 'VMware', host_type: 'esxi', hypervisor: 'esxi', env: 'idc', cloud_env: 'onpremise' },
  { key: 'baremetal', label: i18n.t('dictionary.baremetal'), provider: 'OneCloud-baremetal', brand: 'OneCloud-baremetal', host_type: 'baremetal', hypervisor: 'baremetal', env: 'baremetal', cloud_env: 'onpremise' },
  // Private
  { key: 'openstack', label: 'OpenStack', provider: 'OpenStack', brand: 'OpenStack', host_type: 'openstack', hypervisor: 'openstack', env: 'private', cloud_env: 'private' },
  { key: 'dstack', label: 'DStack', provider: 'ZStack', brand: 'DStack', host_type: 'dstack', hypervisor: 'dstack', env: 'private', cloud_env: 'private' },
  { key: 'zstack', label: 'ZStack', provider: 'ZStack', brand: 'ZStack', host_type: 'zstack', hypervisor: 'zstack', env: 'private', cloud_env: 'private' },
  { key: 'apsara', label: i18n.t('scopeCloudPrvidersMap.Apsara'), provider: 'Apsara', brand: 'Apsara', host_type: 'apsara', hypervisor: 'apsara', env: 'private', cloud_env: 'private' },
  { key: 'cloudpods', label: i18n.t('scopeCloudPrvidersMap.Cloudpods'), provider: 'Cloudpods', brand: 'Cloudpods', host_type: 'cloudpods', hypervisor: 'cloudpods', env: 'private', cloud_env: 'private' },
  { key: 'hcso', label: i18n.t('cloudPrvidersMap.HCSO'), provider: 'HCSO', brand: 'HCSO', host_type: 'hcso', hypervisor: 'hcso', env: 'private', cloud_env: 'private' },
  { key: 'nutanix', label: i18n.t('scopeCloudPrvidersMap.Nutanix'), provider: 'Nutanix', brand: 'Nutanix', host_type: 'nutanix', hypervisor: 'nutanix', env: 'private', cloud_env: 'private' },
  { key: 'bingocloud', label: i18n.t('scopeCloudPrvidersMap.BingoCloud'), provider: 'BingoCloud', brand: 'BingoCloud', host_type: 'bingocloud', hypervisor: 'bingocloud', env: 'private', cloud_env: 'private' },
  // Public
  { key: 'aliyun', label: i18n.t('scopeCloudPrvidersMap.Aliyun'), provider: 'Aliyun', brand: 'Aliyun', host_type: 'aliyun', hypervisor: 'aliyun', env: 'public', cloud_env: 'public' },
  { key: 'azure', label: 'Azure', provider: 'Azure', brand: 'Azure', host_type: 'azure', hypervisor: 'azure', env: 'public', cloud_env: 'public' },
  { key: 'aws', label: 'AWS', provider: 'Aws', brand: 'Aws', host_type: 'aws', hypervisor: 'aws', env: 'public', cloud_env: 'public' },
  { key: 'qcloud', label: i18n.t('scopeCloudPrvidersMap.Qcloud'), provider: 'Qcloud', brand: 'Qcloud', host_type: 'qcloud', hypervisor: 'qcloud', env: 'public', cloud_env: 'public' },
  { key: 'huawei', label: i18n.t('scopeCloudPrvidersMap.Huawei'), provider: 'Huawei', brand: 'Huawei', host_type: 'huawei', hypervisor: 'huawei', env: 'public', cloud_env: 'public' },
  { key: 'ucloud', label: 'UCloud', provider: 'Ucloud', brand: 'Ucloud', host_type: 'ucloud', hypervisor: 'ucloud', env: 'public', cloud_env: 'public' },
  { key: 'google', label: 'Google', provider: 'Google', brand: 'Google', host_type: 'google', hypervisor: 'google', env: 'public', cloud_env: 'public' },
  { key: 'ctyun', label: i18n.t('scopeCloudPrvidersMap.Ctyun'), provider: 'Ctyun', brand: 'Ctyun', host_type: 'ctyun', hypervisor: 'ctyun', env: 'public', cloud_env: 'public' },
  { key: 'ecloud', label: i18n.t('scopeCloudPrvidersMap.Ecloud'), provider: 'Ecloud', brand: 'Ecloud', host_type: 'ecloud', hypervisor: 'ecloud', env: 'public', cloud_env: 'public' },
  { key: 'jdcloud', label: i18n.t('scopeCloudPrvidersMap.JDcloud'), provider: 'JDcloud', brand: 'JDcloud', host_type: 'jdcloud', hypervisor: 'jdcloud', env: 'public', cloud_env: 'public' },
]

export const HYPERVISORS_MAP = arrayToObj(HYPERVISORS, 'key')

export const CLOUD_ENVS = {
  onpremise: 'onpremise',
  private: 'private',
  public: 'public',
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
    cloudpods: HYPERVISORS_MAP.cloudpods,
    zstack: HYPERVISORS_MAP.zstack,
    nutanix: HYPERVISORS_MAP.nutanix,
    bingocloud: HYPERVISORS_MAP.bingocloud,
  },
  public: {
    aliyun: HYPERVISORS_MAP.aliyun,
    azure: HYPERVISORS_MAP.azure,
    aws: HYPERVISORS_MAP.aws,
    qcloud: HYPERVISORS_MAP.qcloud,
    huawei: HYPERVISORS_MAP.huawei,
    ucloud: HYPERVISORS_MAP.ucloud,
    google: HYPERVISORS_MAP.google,
    jdcloud: HYPERVISORS_MAP.jdcloud,
  },
}

// 用户、项目、权限的 scope 类型
export const SCOPES_MAP = {
  system: {
    key: 'system',
  },
  domain: {
    key: 'domain',
  },
  project: {
    key: 'project',
  },
}

// 调度策略
export const SCHEDTAG_POLICY_OPTIONS = Object.keys(i18n.t('schedtagPolicys')).map(key => ({
  key,
  label: i18n.t('schedtagPolicys')[key],
}))

export const ENABLED_OPTS = [
  { key: true, label: i18n.t('status.enabled.true') },
  { key: false, label: i18n.t('status.enabled.false') },
]

// 自定义字典存储配置的name
export const GLOBAL_SETTINGS = 'global-settings'
export const SHOW_SYSTEM_RESOURCE = 'showSystemResource'
export const WIDGET_SETTINGS = 'widget-settings'

// 标识字典允许用户自定义的key
export const ENABLE_USER_CUSTOM_DICTIONARY = [
  'identity_provider',
  'domain',
  'group',
  'user',
  'project',
  'role',
  'policy',
  'schedtag',
]

export const chartColors = ['#4DA1FF', '#FFC760', '#F76F89', '#5ED28A', '#ff5f2e', '#A593E0', '#7f9eb2', '#f6ea8c', '#a5dff9', '#77AAAD', '#E71D36', '#4ea1d3']

export const contactMap = {
  webconsole: {
    label: i18n.t('system.webconsole', []),
    value: 'webconsole',
  },
  email: {
    label: i18n.t('system.text_146'),
    value: 'email',
  },
  mobile: {
    label: i18n.t('system.text_144'),
    value: 'mobile',
  },
  dingtalk: {
    label: i18n.t('system.text_136'),
    value: 'dingtalk',
  },
  feishu: {
    label: i18n.t('system.text_133'),
    value: 'feishu',
  },
  workwx: {
    label: i18n.t('system.wecom.1'),
    value: 'workwx',
  },
}

export const contactArr = Object.keys(contactMap)

export const channelMaps = {
  webconsole: { value: 'webconsole', label: i18n.t('dictionary.infos'), disabled: true, sort: 0 },
  email: { value: 'email', label: i18n.t('common.email'), sort: 1 },
  mobile: { value: 'mobile', label: i18n.t('common.message'), sort: 2 },
  workwx: { value: 'workwx', label: i18n.t('common.workwx'), sort: 3 },
  dingtalk: { value: 'dingtalk', label: i18n.t('common.dingtalk'), sort: 4 },
  feishu: { value: 'feishu', label: i18n.t('common.feishu'), sort: 5 },
  'feishu-robot': { value: 'feishu', label: i18n.t('common.feishu_robot'), sort: 6 },
  'workwx-robot': { value: 'workwx-robot', label: i18n.t('system.wecom.bot'), sort: 7 },
  'dingtalk-robot': { value: 'dingtalk-robot', label: i18n.t('system.text_303'), sort: 8 },
}

export const CURRENCYS = [
  { key: 'CNY', value: i18n.t('common.currency_cny') },
  { key: 'USD', value: i18n.t('common.currency_usd') },
  { key: 'BRL', value: i18n.t('common.currency_brl') },
  { key: '_CNY', value: i18n.t('common.currency_cny') },
  { key: '_USD', value: i18n.t('common.currency_usd') },
  { key: '_BRL', value: i18n.t('common.currency_brl') },
]
export const CURRENCYS_MAP = arrayToObj(CURRENCYS, 'key')

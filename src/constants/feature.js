import * as R from 'ramda'
import i18n from '@/locales'

/** 可选：仅当存在 generalScope/constants/featureMenus.js 且导出 FEATURE_MENUS 时覆盖；无该文件、无 constants 或整个 generalScope 不存在时不报错，用本文件内联的 FEATURE_MENUS。context 必须用 ee 包根目录，勿用 ../../generalScope 作根（目录不存在时 webpack 会解析失败）。 */
function loadFeatureMenusFromGeneralScope () {
  try {
    const ctx = require.context('../../', true, /^\.\/generalScope\/constants\/featureMenus\.js$/)
    const keys = ctx.keys()
    if (!keys.length) return null
    const mod = ctx(keys[0])
    return mod && mod.FEATURE_MENUS != null ? mod.FEATURE_MENUS : null
  } catch (e) {
    return null
  }
}

const FEATURE_MENUS_SCOPE = loadFeatureMenusFromGeneralScope()

// const vIsAccount = R.pipe(R.path(['meta', 'is_account']), R.equals(true))
// const vIsOnestack = R.whereEq({ key: 'onestack' })
// const vIsCloudPlatform = R.pipe(R.path(['meta', 'group']), (group) => { return group && ['onecloud', 'private', 'public'].indexOf(group) >= 0 })
// const vIsCloudAccount = R.and(vIsAccount, vIsCloudPlatform)

// class validators {
//   static onestackSelected (items) {
//     if (R.any(vIsOnestack, items)) return { disabled: false, reason: '' }
//     return { disabled: true, reason: i18n.t('scope.text_115') }
//   }

//   static hasAccount (items) {
//     if (R.any(vIsAccount, items)) return { disabled: false, reason: '' }
//     return { disabled: true, reason: i18n.t('license.validator.is_account') }
//   }

//   static hasCloudAccount (items) {
//     if (R.any(vIsCloudAccount, items)) return { disabled: false, reason: '' }
//     return { disabled: true, reason: i18n.t('scope.text_116') }
//   }
// }

const meta = (module = 'default', group = 'default', is_account = false) => {
  module = module || 'default'
  group = group || 'default'
  return {
    module: module,
    group: group,
    is_account: is_account,
    is_feature: !is_account,
  }
}

/*
* LicenseItem表示license中最小的单元
* @params key 唯一标识
* @params meta 元数据信息。 可选值: module (大类), group (小类), is_account(是否为云账号)， is_feature（是否为功能特性）
*  -- module可选值： resource_managent(资源管理),monitor(监控运维),bill(费用管理), auth(认证管理)
*  -- group 可选值:  onecloud(云联壹云私有云平台),public(公有云纳管),private(私有云&虚拟化平台),storage(对象存储)
*  -- is_account可选值: true/false. 默认false
*  -- is_feature可选值: true/false, 默认false
* @params visiable  是否可见, 默认: true.  true/false || function() boolean
* @params disabled  是否禁用, 默认false. true/false
* @params reason    禁用原因.
* @params validators  校验是否有效. []function () { disabled: true/false, reason: 'xxx' } 禁用原因
* */
const LicenseItems = [
  {
    key: 'onestack',
    meta: meta('resource_managent', 'onecloud', true),
  },
  {
    key: 'pod',
    meta: meta('resource_managent', 'onecloud', false),
  },
  {
    key: 'ai',
    meta: meta('resource_managent', 'onecloud', false),
  },
  {
    key: 'baremetal',
    meta: meta('resource_managent', 'onecloud', false),
  },
  {
    key: 'lb',
    meta: meta('resource_managent', 'onecloud', false),
  },
  {
    key: 'aliyun',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'aws',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'azure',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'ctyun',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'google',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'huawei',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'qcloud',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'ucloud',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'ecloud',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'jdcloud',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'cloudflare',
    meta: meta('resource_managent', 'public', true),
    hiddenName: true,
    logoStyle: {
      width: '100px',
      height: '24px',
    },
  },
  {
    key: 'vmware',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'openstack',
    meta: meta('resource_managent', 'private', true),
  },
  // {
  //   key: 'dstack',
  //   meta: meta('resource_managent', 'private', true),
  // },
  {
    key: 'zstack',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'apsara',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'cloudpods',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'hcso',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'hcs',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'nutanix',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'bingocloud',
    meta: meta('resource_managent', 'private', true),
    hiddenName: true,
    logoStyle: {
      width: '100px',
      height: '24px',
    },
  },
  {
    key: 'incloudsphere',
    meta: meta('resource_managent', 'private', true),
    hiddenName: true,
    logoStyle: {
      width: '100px',
      height: '24px',
    },
  },
  {
    key: 'remotefile',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'proxmox',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'h3c',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'zettakit',
    meta: meta('resource_managent', 'private', true),
    hiddenName: true,
    logoStyle: {
      width: '100px',
      height: '24px',
    },
  },
  {
    key: 'uis',
    meta: meta('resource_managent', 'private', true),
    hiddenName: true,
    logoStyle: {
      width: '100px',
      height: '14px',
    },
  },
  {
    key: 's3',
    meta: meta('resource_managent', 'storage', true),
  },
  {
    key: 'ceph',
    meta: meta('resource_managent', 'storage', true),
  },
  {
    key: 'cephfs',
    meta: meta('resource_managent', 'storage', true),
  },
  {
    key: 'xsky',
    meta: meta('resource_managent', 'storage', true),
    hiddenName: true,
    logoStyle: {
      width: '100px',
      height: '16px',
    },
  },
  {
    key: 'k8s',
    meta: meta('resource_managent', 'container', false),
  },
  {
    key: 'monitor_operation',
    origin_key: 'monitor',
    meta: meta('resource_managent', 'monitor', false),
  },
  {
    key: 'appstore',
    origin_key: 'app_store',
    meta: meta('resource_managent', 'monitor', false),
  },
  {
    key: 'report',
    meta: meta('resource_managent', 'monitor', false),
  },
  {
    key: 'extdb',
    meta: meta('resource_managent', 'monitor', false),
  },
  {
    key: 'bastionhost',
    origin_key: 'bastion_host',
    meta: meta('resource_managent', 'monitor', false),
  },
  {
    key: 'bill_private',
    meta: meta('resource_managent', 'bill', false),
  },
  {
    key: 'bill_aliyun',
    origin_key: 'aliyun',
    meta: meta('resource_managent', 'bill', true),
  },
  {
    key: 'bill_aws',
    origin_key: 'aws',
    meta: meta('resource_managent', 'bill', true),
  },
  {
    key: 'bill_azure',
    origin_key: 'azure',
    meta: meta('resource_managent', 'bill', true),
  },
  {
    key: 'bill_google',
    origin_key: 'google',
    meta: meta('resource_managent', 'bill', true),
  },
  {
    key: 'bill_huawei',
    origin_key: 'huawei',
    meta: meta('resource_managent', 'bill', true),
  },
  {
    key: 'bill_qcloud',
    origin_key: 'qcloud',
    meta: meta('resource_managent', 'bill', true),
  },
  {
    key: 'bill_jdcloud',
    origin_key: 'jdcloud',
    meta: meta('resource_managent', 'bill', true),
  },
  {
    key: 'bill_volcengine',
    origin_key: 'volcengine',
    meta: meta('resource_managent', 'bill', true),
  },
  {
    key: 'bill_ksyun',
    origin_key: 'ksyun',
    meta: meta('resource_managent', 'bill', true),
  },
  {
    key: 'bill_kubernetes',
    origin_key: 'k8s',
    meta: meta('resource_managent', 'bill', false),
  },
  {
    key: 'bill_extdb',
    origin_key: 'extdb',
    meta: meta('resource_managent', 'bill', false),
  },
  {
    key: 'suggestion',
    meta: meta('resource_managent', 'bill', false),
  },
  {
    key: 'auth',
    meta: meta('auth', '', false),
  },
  {
    key: 'baidu',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'ksyun',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'qingcloud',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'chinaunion',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'volcengine',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'oraclecloud',
    meta: meta('resource_managent', 'public', true),
  },
  {
    key: 'sangfor',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'cnware',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'oceanbase',
    meta: meta('resource_managent', 'public', true),
    hiddenName: true,
    logoStyle: {
      width: '100px',
      height: '25px',
    },
  },
  // {
  //   key: 'report',
  //   meta: meta('resource_managent', 'report', false),
  // },
]

function fullfillLicenseItems () {
  LicenseItems.map(item => {
    const key = item.origin_key || item.key
    if (item.meta.is_account) {
      item.label = i18n.getOemDictionaryI18n(key.toLowerCase(), i18n.getI18n([`scopeCloudProvidersMap.${key}`, `scopeProviders.${key}`, `license.provider.${key}`], key))
      item.icon = require(`@/assets/images/providers/${key}.svg`)
    } else {
      item.label = i18n.getOemDictionaryI18n(key.toLowerCase(), i18n.getI18n(`license.feature.${key}`, key))
      item.icon = require(`@/assets/images/features/${key}.svg`)
    }
    item.value = item.key
  })
}

function getMetaValues (keyName) {
  const vs = LicenseItems.filter(item => {
    return item.meta[keyName]
  }).map(item => {
    return item.meta[keyName]
  })

  return R.uniq(vs)
}

function module (name) {
  return {
    label: i18n.t(`license.module.${name}`),
    key: 'module-' + name,
    value: name,
    groups: [],
  }
}

function group (name) {
  return {
    label: i18n.t(`license.group.${name}`),
    key: 'group-' + name,
    value: name,
    items: [],
  }
}

function get (elements, v, createFunc) {
  let e = R.find(R.propEq('value', v))(elements)
  if (!e) {
    e = createFunc(v)
    elements.push(e)
  }
  return e
}

/**
 * 层次关系： module -> group -> item
 * @returns { module: { group: [item1, item2, ...],}, }
 */
function getModuleGroups () {
  const modules = []
  LicenseItems.map(item => {
    const m = get(modules, item.meta.module, module)
    const g = get(m.groups, item.meta.group, group)
    g.items.push(item)
  })
  return modules
}

fullfillLicenseItems()

const FEATURE_MENUS = {
  onestack: {
    ceMenus: ['vminstance', 'instancegroup', 'servertemplate', 'scalinggroup', 'image', 'host_image', 'disk', 'disk-snapshot', 'instance-snapshot', 'snapshotpolicy', 'disk-backup', 'instance-backup', 'keypair', 'sku', 'host', 'gpu', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'imagerecovery', 'zone', 'vpc', 'wire', 'network', 'secgroup', 'eip', 'dns-zone', 'tap-service', 'blockstorage', 'backup-storage'],
  },
  pod: {
    ceMenus: ['vminstance-container', 'app-package', 'image-repos', 'disk', 'disk-backup', 'instance-backup', 'host', 'gpu', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'zone', 'vpc', 'wire', 'network', 'secgroup', 'eip', 'dns-zone', 'blockstorage', 'backup-storage', 'credentials-container-image', 'credentials-container-secret'],
  },
  ai: {
    ceMenus: ['app-llm', 'app-llm-sku', 'llm', 'llm-sku', 'llm-instantmodel', 'llm-image'],
  },
  baremetal: {
    ceMenus: ['baremetal', 'image', 'keypair', 'physicalmachine', 'gpu', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'imagerecovery', 'zone'],
  },
  lb: {
    ceMenus: ['zone', 'vpc', 'routetable', 'wire', 'network', 'secgroup', 'eip', 'lb', 'lbacl', 'lbcert', 'health-check', 'cluster', 'lbagent'],
  },
  aliyun: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'snapshotpolicy', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc-network', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'nat', 'dns-zone', 'waf', 'lb', 'lbacl', 'lbcert', 'cdn', 'ssl-certificate', 'bucket', 'table-storage', 'nas', 'access-group', 'rds', 'redis', 'mongodb', 'kafka', 'elasticsearch', 'navbar-clouduser', 'navbar-nopswlogin'],
  },
  aws: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'nat', 'dns-zone', 'waf', 'lb', 'lbcert', 'cdn', 'bucket', 'rds', 'redis', 'navbar-clouduser', 'navbar-nopswlogin'],
  },
  azure: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'waf', 'lb', 'bucket', 'rds', 'redis'],
  },
  ctyun: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'network'],
  },
  gcp: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'snapshotpolicy', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'globalvpc', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'lb', 'lbcert', 'cdn', 'ssl-certificate', 'bucket', 'rds', 'redis'],
  },
  huawei: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'snapshotpolicy', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc-peerconnect', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'nat', 'lb', 'lbacl', 'lbcert', 'cdn', 'ssl-certificate', 'bucket', 'nas', 'rds', 'redis'],
  },
  qcloud: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'snapshotpolicy', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc-network', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'nat', 'dns-zone', 'waf', 'lb', 'lbcert', 'cdn', 'ssl-certificate', 'bucket', 'rds', 'redis', 'mongodb', 'kafka', 'elasticsearch'],
  },
  ucloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  ecloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip'],
  },
  jdcloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'eip'],
  },
  cloudflare: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'lb', 'lbcert', 'health-check'],
  },
  baidu: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'eip', 'bucket', 'rds'],
  },
  ksyun: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  qingcloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping'],
  },
  wocloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image'],
  },
  volcengine: {
    ceMenus: ['cloudaccount', 'cloudgroup', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'routetable', 'network', 'secgroup', 'eip', 'bucket'],
  },
  oraclecloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  oceanbase: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'instance-snapshot', 'host', 'network', 'secgroup', 'blockstorage'],
  },
  vmware: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'routetable', 'wire', 'network', 'secgroup', 'eip', 'lb', 'lbacl', 'blockstorage'],
  },
  openstack: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'wire', 'network', 'secgroup', 'eip', 'blockstorage'],
  },
  zstack: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'snapshotpolicy', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'wire', 'network', 'secgroup', 'eip', 'lb', 'blockstorage', 'bucket'],
  },
  apsara: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'wire', 'network', 'secgroup', 'eip', 'blockstorage'],
  },
  cloudpods: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'disk-snapshot', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'wire', 'network', 'secgroup', 'eip', 'blockstorage'],
  },
  hcso: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  hcsop: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  hcs: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  nutanix: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'host', 'wire', 'network', 'secgroup', 'blockstorage'],
  },
  bingocloud: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'wire', 'network', 'secgroup', 'blockstorage'],
  },
  incloudsphere: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'wire', 'network', 'secgroup', 'blockstorage'],
  },
  remotefile: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'network', 'secgroup', 'blockstorage'],
  },
  proxmox: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery', 'vpc', 'network', 'secgroup', 'blockstorage'],
  },
  h3c: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  zettakit: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  uis: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  sangfor: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  cnware: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'vminstance', 'servertemplate', 'image', 'disk', 'keypair', 'sku', 'schedtag', 'schedpolicy', 'dynamicschedtag', 'serverrecovery', 'diskrecovery'],
  },
  s3: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'bucket'],
  },
  ceph: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'bucket'],
  },
  cephfs: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'nas'],
  },
  xsky: {
    ceMenus: ['cloudaccount', 'proxysetting', 'projectmapping', 'bucket'],
  },
  k8s: {
    ceMenus: ['k8s-deployment', 'k8s-statefulset', 'k8s-daemonset', 'k8s-job', 'k8s-cronjob', 'k8s-pod', 'k8s-persistentvolumeclaim', 'k8s-service', 'k8s-ingress', 'k8s-configmap', 'k8s-secret', 'k8s-cluster', 'k8s-node', 'k8s-storageclass', 'k8s-namespace', 'k8s-rbacrole', 'k8s-rbacclusterrole', 'k8s-rbacrolebinding', 'k8s-rbacclusterrolebinding', 'k8s-serviceaccount', 'k8s-kubecomponent'],
  },
  monitor_operation: {
    ceMenus: ['monitoroverview', 'monitor-dashboard', 'explorer', 'commonalerts', 'alertresource', 'alertrecord', 'monitorresourcealerts', 'notification', 'notify-topic', 'notifyconfig', 'contact', 'robot', 'scheduledtask', 'navbar-alert', 'navbar-notification'],
  },
  appstore: {
    ceMenus: ['vm-release', 'k8s-release', 'k8s-chart', 'k8s-repo'],
  },
  report: {
    ceMenus: [],
  },
  extdb: {
    ceMenus: [],
  },
  bastionhost: {
    ceMenus: [],
  },
  bill_private: {
    ceMenus: [],
  },
  bill_kubernetes: {
    ceMenus: [],
  },
  bill_extdb: {
    ceMenus: [],
  },
  suggestion: {
    ceMenus: [],
  },
  bill_aliyun: {
    ceMenus: [],
  },
  bill_aws: {
    ceMenus: [],
  },
  bill_azure: {
    ceMenus: [],
  },
  bill_google: {
    ceMenus: [],
  },
  bill_huawei: {
    ceMenus: [],
  },
  bill_qcloud: {
    ceMenus: [],
  },
  bill_jdcloud: {
    ceMenus: [],
  },
  bill_volcengine: {
    ceMenus: [],
  },
  bill_ksyun: {
    ceMenus: [],
  },
  auth: {
    ceMenus: ['idp', 'domain', 'project', 'group', 'systemuser', 'role', 'policy', 'suggestsysalert', 'suggestsysruleconfig', 'suggestsysrule', 'navbar-cloudshell', 'navbar-language', 'navbar-change-password', 'credentials-aksk'],
  },
}

const featureMenus = FEATURE_MENUS_SCOPE || FEATURE_MENUS

export default {
  modules: getMetaValues('module'),
  groups: getMetaValues('group'),
  items: LicenseItems,
  moduleGroups: getModuleGroups(),
  featureMenus,
}

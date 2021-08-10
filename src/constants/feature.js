import * as R from 'ramda'
import i18n from '@/locales'

const vIsAccount = R.pipe(R.path(['meta', 'is_account']), R.equals(true))
const vIsOnestack = R.whereEq({ key: 'onestack' })
const vIsCloudPlatform = R.pipe(R.path(['meta', 'group']), (group) => { return group && ['onecloud', 'private', 'public'].indexOf(group) >= 0 })
const vIsCloudAccount = R.and(vIsAccount, vIsCloudPlatform)

class validators {
  static onestackSelected (items) {
    if (R.any(vIsOnestack, items)) return { disabled: false, reason: '' }
    return { disabled: true, reason: i18n.t('scope.text_115') }
  }

  static hasAccount (items) {
    if (R.any(vIsAccount, items)) return { disabled: false, reason: '' }
    return { disabled: true, reason: i18n.t('license.validator.is_account') }
  }

  static hasCloudAccount (items) {
    if (R.any(vIsCloudAccount, items)) return { disabled: false, reason: '' }
    return { disabled: true, reason: i18n.t('scope.text_116') }
  }
}

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
    key: 'baremetal',
    meta: meta('resource_managent', 'onecloud', false),
    validators: [validators.onestackSelected],
  },
  {
    key: 'lb',
    meta: meta('resource_managent', 'onecloud', false),
    validators: [validators.onestackSelected],
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
    key: 'vmware',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'openstack',
    meta: meta('resource_managent', 'private', true),
  },
  {
    key: 'dstack',
    meta: meta('resource_managent', 'private', true),
  },
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
    key: 'huaweicloudstack',
    meta: meta('resource_managent', 'private', true),
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
    key: 'xsky',
    meta: meta('resource_managent', 'storage', true),
  },
  {
    key: 'k8s',
    meta: meta('resource_managent', 'container', false),
    validators: [validators.hasCloudAccount],
  },
  {
    key: 'monitor',
    meta: meta('monitor', '', false),
  },
  {
    key: 'bill',
    meta: meta('bill', '', false),
  },
  {
    key: 'auth',
    meta: meta('auth', '', false),
  },
]

function fullfillLicenseItems () {
  LicenseItems.map(item => {
    if (item.meta.is_account) {
      item.label = i18n.t(`license.provider.${item.key}`)
      item.icon = require(`@/assets/images/providers/${item.key}.svg`)
    } else {
      item.label = i18n.t(`license.feature.${item.key}`)
      item.icon = require(`@/assets/images/features/${item.key}.svg`)
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

export default {
  modules: getMetaValues('module'),
  groups: getMetaValues('group'),
  items: LicenseItems,
  moduleGroups: getModuleGroups(),
}

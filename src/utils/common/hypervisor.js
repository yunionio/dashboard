import * as R from 'ramda'
import _ from 'lodash'
import { HYPERVISORS_MAP, EXTRA_HYPERVISORS } from '@/constants'
import { changeToArr } from '@/utils/utils'
import store from '@/store'
import i18n from '@/locales'
import { hasSetupKey } from '@/utils/auth'

export class TypeClouds {
  hypervisorMap = {}
  brandMap = {}
  brandlowcaseMap = {}
  providerMap = {}
  providerlowcaseMap = {}
  hosttypeMap = {}
  constructor ({ ignore = [], env = ['idc', 'private', 'public'] } = {}) {
    this.ignore = ignore
    this.env = changeToArr(env)
    this.initMap()
  }

  initMap () {
    this.hypervisorMap = Object.assign({}, HYPERVISORS_MAP, EXTRA_HYPERVISORS)
    // 支持 hypervisor、brand、provider、host_type
    R.forEachObjIndexed((obj, key) => {
      if (this.env.includes(obj.env)) {
        const brandObj = { ...obj, key: obj.brand }
        const providerObj = { ...obj, key: obj.provider }
        const hosttypeObj = { ...obj, key: obj.host_type }
        this.brandMap[obj.brand] = brandObj
        this.brandlowcaseMap[obj.brand.toLowerCase()] = brandObj
        this.providerMap[obj.provider] = providerObj
        this.providerlowcaseMap[obj.provider.toLowerCase()] = providerObj
        this.hosttypeMap[obj.host_type] = hosttypeObj
      }
    }, this.hypervisorMap)
  }

  commonGet (map) {
    const currentMap = {}
    R.forEachObjIndexed((obj, key) => {
      if (!this.ignore.includes(key.toLowerCase())) {
        currentMap[key] = obj
      }
    }, map)
    return currentMap
  }

  getBrandlowcase () {
    return this.commonGet(this.brandlowcaseMap)
  }

  getProviderlowcase () {
    return this.commonGet(this.brandlowcaseMap)
  }

  getHypervisor () {
    return this.commonGet(this.hypervisorMap)
  }

  getProvider () {
    return this.commonGet(this.providerMap)
  }

  getBrand () {
    return this.commonGet(this.brandMap)
  }

  getHosttype () {
    return this.commonGet(this.hosttypeMap)
  }
}

export const typeClouds = new TypeClouds()

/**
 * @param {String} provider 传入的 provider, e.g. kvm、vmware、aliyun
 * @param {String} type 根据 provider, brand 还是 hypervisor 去查找
 * @returns {String|false} 返回对应的平台
 */
export const findPlatform = (provider, type = 'brand') => {
  if (provider) {
    provider = provider.toLowerCase()
    if (type === 'provider') {
      const provierItem = typeClouds.providerlowcaseMap[provider]
      if (provierItem) return provierItem.env
    }
    if (type === 'hypervisor') {
      const provierItem = typeClouds.hypervisorMap[provider]
      if (provierItem) return provierItem.env
    }
    if (type === 'brand') {
      const provierItem = typeClouds.brandlowcaseMap[provider]
      if (provierItem) return provierItem.env
    }
  }
  return false // 未找到平台
}

/**
 * @description 根据实际的brand，计算出cloud env
 * @param {String} capabilityBrandKey 传入capability中brand标识key
 * @param {Boolean} ignoreAll 是否需要隐藏全部选项
 * @returns {Array} 返回含有的cloudenv
 */
export const getCloudEnvOptions = (capabilityBrandKey, ignoreAll) => {
  const orderKeys = ['onpremise', 'private', 'public']
  let ret = !ignoreAll ? [{ key: '', label: i18n.t('common_95') }] : []
  const brands = store.getters.capability[capabilityBrandKey] || store.getters.capability.brands || []
  for (let i = 0, len = brands.length; i < len; i++) {
    const key = _.get(typeClouds.brandMap, `[${brands[i]}].cloud_env`)
    const data = R.find(R.propEq('key', key))(ret)
    if (key && !data) {
      ret.push({ key: key, label: i18n.t(`cloud_env.${key}`) })
      if (capabilityBrandKey === 'network_manage_brands' && !hasSetupKey(['onecloud', 'onestack', 'baremetal', 'lb', 'vmware'])) {
        ret = ret.filter(v => v.key !== 'onpremise')
      }
    }
  }
  ret = ret.sort((a, b) => orderKeys.indexOf(a.key) - orderKeys.indexOf(b.key))
  return ret
}

/**
 * 获取禁用的云平台对action验证的meta
 * @param {Object} obj {row, rows, disabledProviders, supportProviders, matchType, matchKey} matchType 取值 every，some
 * @returns {Object} {validate: Boolean, tooltip: String}
 */
export const getDisabledProvidersActionMeta = ({ row, rows, disabledProviders, matchType = 'every', matchKey }) => {
  const ret = { validate: true }
  const dataList = row ? [row] : rows
  if (!dataList.length) return ret
  try {
    // 禁用操作的云平台
    if (disabledProviders.length) {
      let hypervisorText = ''
      dataList.map(item => {
        // 取用data中的哪个字段去匹配hypervisor
        const dataHypervisor = matchKey ? item[matchKey] : item.hypervisor || item.provider || ''
        if (dataHypervisor && disabledProviders.includes(dataHypervisor)) {
          ret.validate = false
          hypervisorText += hypervisorText ? '、' : ''
          hypervisorText += typeClouds.brandlowcaseMap[dataHypervisor.toLowerCase()].label
        }
      })
      if (!ret.validate) {
        ret.tooltip = i18n.t('compute.text_473', [hypervisorText])
      }
    }
    // TODO 支持操作的云平台
  } catch (err) { }
  return ret
}

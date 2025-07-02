import * as R from 'ramda'
import i18n from '@/locales'
import { getLanguage } from '@/utils/common/cookie'
import { dnsTypes, cn_regions, provinces, continents, aliyun_ee_operators, aliyun_ee_cloudvendors, aliyun_ee_searchengines } from '../constants'

const isPublicZone = (zone_type) => {
  return zone_type === 'PublicZone'
}

export const getDnsTypes = ({ zone_type }) => {
  if (isPublicZone(zone_type)) {
    return dnsTypes.filter((item) => {
      return item.value !== 'PTR'
    })
  }
  return dnsTypes
}

export const getDnsProviders = (providers, { zone_type }) => {
  const dnsProviderMap = {
    publicZones: ['Aws', 'Qcloud', 'Aliyun'],
    privateZones: ['Aws', 'Aliyun'],
  }
  return providers.filter((item) => {
    if (isPublicZone(zone_type)) {
      return dnsProviderMap.publicZones.includes(item.value)
    }
    return dnsProviderMap.privateZones.includes(item.value)
  })
}

export const getTtls = ({ zone_type }) => {
  if (isPublicZone(zone_type)) {
    return [
      { label: i18n.t('common_171'), value: 10 * 60 }, // 10分钟
      { label: i18n.t('common_172'), value: 30 * 60 }, // 30分钟
      { label: i18n.t('common_173'), value: 1 * 60 * 60 }, // 1小时
      { label: i18n.t('common_674'), value: 12 * 60 * 60 }, // 12小时
      { label: i18n.t('common_178'), value: 1 * 24 * 60 * 60 }, // 1天
    ]
  } else {
    return [
      { label: i18n.t('network.text_188', [5]), value: 5 }, // 5秒
      { label: i18n.t('network.text_188', [30]), value: 30 }, // 30秒
      { label: i18n.t('network.text_187', [1]), value: 60 }, // 1分钟
      { label: i18n.t('common_173'), value: 1 * 60 * 60 }, // 1小时
      { label: i18n.t('common_674'), value: 12 * 60 * 60 }, // 12小时
      { label: i18n.t('common_178'), value: 1 * 24 * 60 * 60 }, // 1天
    ]
  }
}

const getLanguageLabel = (item) => {
  const lan = getLanguage()
  if (lan === 'zh-CN') {
    return item.label_zh || item.label
  } else if (lan === 'en') {
    return item.label_en || item.label
  } else if (lan === 'ja-JP') {
    return item.label_ja || item.label
  }
  return item.label_en || item.label
}

export const getPolicyValueOpts = (type) => {
  if (type === 'Simple') {
    return [{ label: i18n.t('network.dns.simple'), value: 'default' }]
  }
  if (type === 'ByGeoLocation') {
    const regions = R.clone(cn_regions)
    const provs = R.clone(provinces)
    regions.forEach(item => {
      item.value = `cn_region_${item.key}`
      item.children = provs.filter(province => province.region === item.key)
      item.children.forEach(province => {
        province.value = `cn_region_${province.key}`
      })
    })
    const cons = R.clone(continents)
    cons.forEach(item => {
      item.value = `os_${item.key}`
      if (item.children) {
        item.children.forEach(region => {
          region.value = `os_${item.key}_${region.key}`
          region.label = getLanguageLabel(region)
          if (region.children) {
            region.children.forEach(province => {
              province.value = `os_${item.key}_${region.key}_${province.key}`
              province.label = getLanguageLabel(province)
            })
          }
        })
      }
    })
    return [
      {
        label: i18n.t('network.dns.mainland'),
        value: 'internal',
        children: regions,
      },
      {
        label: i18n.t('network.dns.oversea'),
        value: 'oversea',
        children: cons,
      },
    ]
  }
  if (type === 'ByCarrier') {
    return aliyun_ee_operators
  }
  if (type === 'ByCloudPlatform') {
    return aliyun_ee_cloudvendors
  }
  if (type === 'BySearchEngine') {
    return aliyun_ee_searchengines
  }
  return []
}

export const getAliyunEEPolicyValuePath = (type, value) => {
  const options = getPolicyValueOpts(type)
  if (options.length) {
    for (let a = 0; a < options.length; a++) {
      const aItem = options[a]
      if (aItem.value === value) {
        return { path: [value], label: aItem.label }
      }
      if (aItem.children) {
        for (let b = 0; b < aItem.children.length; b++) {
          const bItem = aItem.children[b]
          if (bItem.value === value) {
            return { path: [aItem.value, bItem.value], label: `${aItem.label}/${bItem.label}` }
          }
          if (bItem.children) {
            for (let c = 0; c < bItem.children.length; c++) {
              const cItem = bItem.children[c]
              if (cItem.value === value) {
                return { path: [aItem.value, bItem.value, cItem.value], label: `${aItem.label}/${bItem.label}/${cItem.label}` }
              }
              if (cItem.children) {
                for (let d = 0; d < cItem.children.length; d++) {
                  const dItem = cItem.children[d]
                  if (dItem.value === value) {
                    return { path: [aItem.value, bItem.value, cItem.value, dItem.value], label: `${aItem.label}/${bItem.label}/${cItem.label}/${dItem.label}` }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return { path: [], label: '' }
}

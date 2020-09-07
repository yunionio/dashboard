import { dnsTypes } from '../constants'

import i18n from '@/locales'

export const getDnsTypes = () => {
  return dnsTypes
}

export const getDnsProviders = (providers, { zone_type }) => {
  const publicZonesProvider = ['Aws']
  return providers.filter((item) => {
    if (zone_type === 'PublicZone') {
      return !publicZonesProvider.includes(item.value)
    }
    return publicZonesProvider.includes(item.value)
  })
}

export const getTtls = ({ zone_type }) => {
  if (zone_type === 'PublicZone') {
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

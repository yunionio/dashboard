import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import i18n from '@/locales'
import { arrayToObj } from '@/utils/utils'

countries.registerLocale(enLocale)
const names = countries.getNames('en')

export const COUNTRYS = Object.entries(names)
  .map(([key, label]) => ({ key, label }))
  .sort((a, b) => a.label.localeCompare(b.label))

export const AREAS = [
  { key: 'mainland', label: i18n.t('network.cdn.area.mainland') },
  { key: 'overseas', label: i18n.t('network.cdn.area.overseas') },
  { key: 'global', label: i18n.t('network.cdn.area.global') },
]
export const AREA_MAP = arrayToObj(AREAS, 'key')

export const SERVICE_TYPES = [
  { key: 'web', label: i18n.t('network.cdn.service_type_web') }, // CDN网页小文件
  { key: 'download', label: i18n.t('network.cdn.service_type_download') }, // CDN下载大文件
  { key: 'media', label: i18n.t('network.cdn.service_type_media') }, // CDN音视频点播
  { key: 'hybrid', label: i18n.t('network.cdn.service_type_hybrid') }, // ECDN动静加速
  { key: 'dynamic', label: i18n.t('network.cdn.service_type_dynamic') }, // ECDN动态加速
]
export const SERVICE_TYPE_MAP = arrayToObj(SERVICE_TYPES, 'key')

export const ORIGIN_TYPES = [
  { key: 'domain', label: i18n.t('network.cdn.origin_type_domain') },
  // { key: 'cos', label: i18n.t('network.cdn.origin_type_cos') },
]

// 回源协议
export const ORIGIN_PROTOCOLS = [
  { key: 'http', label: 'HTTP' },
  { key: 'https', label: 'HTTPS' },
  { key: 'follow', label: i18n.t('network.cdn.origin_protocol_follow') },
]

// SSL设置
export const SSL_SETTINGS = [
  { key: 'off', label: i18n.t('network.cdn.ssl_setting.off') },
  { key: 'flexible', label: i18n.t('network.cdn.ssl_setting.flexible') },
  { key: 'full', label: i18n.t('network.cdn.ssl_setting.full') },
  { key: 'strict', label: i18n.t('network.cdn.ssl_setting.strict') },
  { key: 'origin_pull', label: i18n.t('network.cdn.ssl_setting.origin_pull') },
]

// 缓存级别
export const CACHE_LEVELS = [
  { key: 'basic', label: i18n.t('network.cdn.cache_level.basic') },
  { key: 'simplified', label: i18n.t('network.cdn.cache_level.simplified') },
  { key: 'aggressive', label: i18n.t('network.cdn.cache_level.aggressive') },
]

// 浏览器缓存TTL
export const BROWSER_CACHE_TTL = [
  { key: 0, label: i18n.t('network.cdn.browser_cache_ttl.origin') },
  { key: 60 * 2, label: i18n.t('network.cdn.browser_cache_ttl.minute', [2]) },
  { key: 60 * 5, label: i18n.t('network.cdn.browser_cache_ttl.minute', [5]) },
  { key: 60 * 20, label: i18n.t('network.cdn.browser_cache_ttl.minute', [20]) },
  { key: 60 * 30, label: i18n.t('network.cdn.browser_cache_ttl.minute', [30]) },
  { key: 60 * 60, label: i18n.t('network.cdn.browser_cache_ttl.hour', [1]) },
  { key: 60 * 60 * 2, label: i18n.t('network.cdn.browser_cache_ttl.hour', [2]) },
  { key: 60 * 60 * 3, label: i18n.t('network.cdn.browser_cache_ttl.hour', [3]) },
  { key: 60 * 60 * 4, label: i18n.t('network.cdn.browser_cache_ttl.hour', [4]) },
  { key: 60 * 60 * 5, label: i18n.t('network.cdn.browser_cache_ttl.hour', [5]) },
  { key: 60 * 60 * 8, label: i18n.t('network.cdn.browser_cache_ttl.hour', [8]) },
  { key: 60 * 60 * 12, label: i18n.t('network.cdn.browser_cache_ttl.hour', [12]) },
  { key: 60 * 60 * 16, label: i18n.t('network.cdn.browser_cache_ttl.hour', [16]) },
  { key: 60 * 60 * 20, label: i18n.t('network.cdn.browser_cache_ttl.hour', [20]) },
  { key: 60 * 60 * 24, label: i18n.t('network.cdn.browser_cache_ttl.day', [1]) },
  { key: 60 * 60 * 24 * 2, label: i18n.t('network.cdn.browser_cache_ttl.day', [2]) },
  { key: 60 * 60 * 24 * 3, label: i18n.t('network.cdn.browser_cache_ttl.day', [3]) },
  { key: 60 * 60 * 24 * 4, label: i18n.t('network.cdn.browser_cache_ttl.day', [4]) },
  { key: 60 * 60 * 24 * 5, label: i18n.t('network.cdn.browser_cache_ttl.day', [5]) },
  { key: 60 * 60 * 24 * 8, label: i18n.t('network.cdn.browser_cache_ttl.day', [8]) },
  { key: 60 * 60 * 24 * 12, label: i18n.t('network.cdn.browser_cache_ttl.day', [12]) },
  { key: 60 * 60 * 24 * 16, label: i18n.t('network.cdn.browser_cache_ttl.day', [16]) },
  { key: 60 * 60 * 24 * 20, label: i18n.t('network.cdn.browser_cache_ttl.day', [20]) },
  { key: 60 * 60 * 24 * 24, label: i18n.t('network.cdn.browser_cache_ttl.day', [24]) },
  { key: 60 * 60 * 24 * 31, label: i18n.t('network.cdn.browser_cache_ttl.month', [1]) },
  { key: 60 * 60 * 24 * 31 * 2, label: i18n.t('network.cdn.browser_cache_ttl.month', [2]) },
  { key: 60 * 60 * 24 * 31 * 6, label: i18n.t('network.cdn.browser_cache_ttl.month', [6]) },
  { key: 60 * 60 * 24 * 31 * 12, label: i18n.t('network.cdn.browser_cache_ttl.year', [1]) },
]

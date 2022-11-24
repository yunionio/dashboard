import i18n from '@/locales'
import { arrayToObj } from '@/utils/utils'

export const AREAS = [
  { key: 'mainland', label: i18n.t('network.cdn.area.mainland') },
  { key: 'overseas', label: i18n.t('network.cdn.area.overseas') },
  { key: 'global', label: i18n.t('network.cdn.area.global') },
]
export const AREA_MAP = arrayToObj(AREAS, 'key')

export const SERVICE_TYPES = [
  { key: 'web', label: i18n.$t('network.cdn.service_type_web') }, // CDN网页小文件
  { key: 'download', label: i18n.$t('network.cdn.service_type_download') }, // CDN下载大文件
  { key: 'media', label: i18n.$t('network.cdn.service_type_media') }, // CDN音视频点播
  { key: 'hybrid', label: i18n.$t('network.cdn.service_type_hybrid') }, // ECDN动静加速
  { key: 'dynamic', label: i18n.$t('network.cdn.service_type_dynamic') }, // ECDN动态加速
]
export const SERVICE_TYPE_MAP = arrayToObj(SERVICE_TYPES, 'key')

export const ORIGIN_TYPES = [
  { key: 'domain', label: i18n.t('network.cdn.origin_type_domain') },
  { key: 'cos', label: i18n.t('network.cdn.origin_type_cos') },
]

// 回源协议
export const ORIGIN_PROTOCOLS = [
  { key: 'http', label: 'HTTP' },
  { key: 'https', label: 'HTTPS' },
  { key: 'follow', label: i18n.t('network.cdn.origin_protocol_follow') },
]

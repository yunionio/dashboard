import Vue from 'vue'
import i18n from '@/locales'

const __renderHVm = new Vue()
const createElement = (...args) => __renderHVm.$createElement(...args)

export function getNetworkTags (row) {
  if (!row) return []
  if (row.network_tags?.length) return row.network_tags
  if (row.config_info?.network_tags?.length) return row.config_info.network_tags
  return []
}

export function formatNetworkTagText (tags) {
  if (!tags?.length) return ''
  return `${i18n.t('compute.network_tag')}：${tags.join(', ')}`
}

export function formatServerSecgroupText (row) {
  const networkTags = getNetworkTags(row)
  if (networkTags.length) return formatNetworkTagText(networkTags)
  if (row?.secgroups?.length) {
    return row.secgroups.map(item => (typeof item === 'string' ? item : item.name)).join(', ')
  }
  return ''
}

export function isServerNetworkTagMode (row) {
  return getNetworkTags(row).length > 0 && !(row?.secgroups?.length)
}

export function renderNetworkTagNodes (tags) {
  if (!tags?.length) return null
  return [
    `${i18n.t('compute.network_tag')}：`,
    ...tags.map(tag => createElement('a-tag', { class: 'mb-2 mr-1', key: tag }, tag)),
  ]
}

import * as R from 'ramda'
import store from '@/store'
import i18n from '@/locales'
import { HYPERVISORS_MAP } from '@/constants'

export function getBrandItems (key = 'brands', outBrands = []) {
  let brands = store.getters.capability[key] || []
  if (store.getters.capability[`disabled_${key}`]) {
    brands = brands.concat(store.getters.capability[`disabled_${key}`] || [])
    brands = R.uniq(brands)
  }
  return brands.map(item => {
    const brandConfig = HYPERVISORS_MAP[item.toLowerCase()] || {}
    return { key: item, label: brandConfig.label || item }
  }).filter(({ key }) => {
    if (R.type(outBrands) === 'Array' && !R.isEmpty(outBrands)) {
      return outBrands.indexOf(key) === -1
    }
    return true
  })
}

export function mapperStatusToItems (items, statusModule) {
  const status = i18n.t(`status.${statusModule}`) || {}
  return items.map(item => {
    let label = item.label
    if (status) {
      if (!R.is(String, status)) {
        label = status[item.key] || item.label
      }
    }
    return {
      key: item.key,
      label,
    }
  })
}

export function getNameFilter ({ field = 'name', label = '名称' } = {}) {
  return {
    label,
    filter: true,
    formatter: val => {
      return `${field}.contains(${val})`
    },
  }
}

export function getBrandFilter (key, outBrands) {
  return {
    label: '平台',
    dropdown: true,
    multiple: true,
    items: getBrandItems(key, outBrands),
  }
}

export function getStatusFilter (params) {
  let label = '状态'
  let statusModule = ''
  let field = 'status'
  if (R.type(params) === 'Object') {
    label = params.title || label
    statusModule = params.statusModule
    field = params.field || field
  }
  if (R.type(params) === 'String') {
    statusModule = params
  }
  return {
    label,
    dropdown: true,
    multiple: true,
    distinctField: {
      type: 'field',
      key: field,
    },
    mapper: data => {
      return mapperStatusToItems(data, statusModule)
    },
    filter: true,
    formatter: val => {
      return `${field}.in(${val.join(',')})`
    },
  }
}

export function getTenantFilter () {
  return {
    label: i18n.t('dictionary.project'),
    dropdown: true,
    multiple: true,
    distinctField: {
      type: 'extra_field',
      key: 'tenant',
    },
  }
}

export function getAccountFilter () {
  return {
    label: '云账号',
    dropdown: true,
    multiple: true,
    distinctField: {
      type: 'extra_field',
      key: 'account',
    },
  }
}

export function getIpFilter () {
  return {
    label: 'IP',
    filter: true,
    formatter: val => {
      return `guestnetworks.guest_id(id).ip_addr.contains("${val}")`
    },
    jointFilter: true,
  }
}

export function getOsTypeFilter () {
  return {
    label: '系统类型',
    dropdown: true,
    multiple: true,
    items: [
      { label: 'Windows', key: 'windows' },
      { label: 'Linux', key: 'linux' },
      { label: 'VMware', key: 'VMWare' },
    ],
    filter: true,
    formatter: val => {
      return `os_type.contains("${val}")`
    },
  }
}

export function getEnabledFilter (params = {}) {
  const { label = '启用状态' } = params
  return {
    label,
    dropdown: true,
    items: [
      { label: '启用', key: true },
      { label: '禁用', key: false },
    ],
  }
}

export function getFilter (params = {}) {
  const { field, title, ...otherParams } = params
  const options = {
    label: title,
    filter: true,
    formatter: val => {
      return `${field}.contains("${val}")`
    },
    ...otherParams,
  }
  if (options.items || options.distinctField) {
    options.dropdown = true
  }
  return options
}

export function getPublicFilter () {
  return {
    label: '共享模式',
    filter: true,
    dropdown: true,
    multiple: true,
    items: [
      { label: '私有', key: 'account_domain' },
      { label: '共享云账号', key: 'system' },
      { label: '共享订阅', key: 'provider_domain' },
    ],
    formatter: val => {
      return `share_mode.contains("${val}")`
    },
  }
}

export function getHostFilter () {
  return {
    label: '宿主机',
    filter: true,
    jointFilter: true,
    formatter: val => {
      return `hosts.id(host_id).name.contains("${val}")`
    },
  }
}

export function getProjectFilter () {
  return {
    label: i18n.t('dictionary.project'),
    dropdown: true,
    distinctField: {
      type: 'field',
      key: 'project',
    },
  }
}

export function getDomainFilter () {
  return {
    label: i18n.t('dictionary.domain'),
    dropdown: true,
    distinctField: {
      type: 'field',
      key: 'domain',
    },
  }
}

export function getProjectDomainFilter () {
  return {
    label: i18n.t('dictionary.domain'),
    dropdown: true,
    distinctField: {
      type: 'extra_field',
      key: 'domain',
    },
  }
}

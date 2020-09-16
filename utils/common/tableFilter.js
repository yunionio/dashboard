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
    const obj = { key: item, label: brandConfig.label || item }
    if (obj.label === 'OneCloud') {
      obj.label = i18n.t('brand')
    }
    return obj
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

export function getNameFilter ({ field = 'name', label = i18n.t('common_186') } = {}) {
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
    label: i18n.t('common_283'),
    dropdown: true,
    multiple: true,
    items: getBrandItems(key, outBrands),
  }
}

export function getStatusFilter (params) {
  let label = i18n.t('common_284')
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
    label: i18n.t('common_295'),
    dropdown: true,
    multiple: true,
    distinctField: {
      type: 'extra_field',
      key: 'account',
    },
    hidden: () => store.getters.isProjectMode,
  }
}

export function getIpFilter () {
  return {
    label: 'IP',
    filter: true,
    formatter: val => {
      return `guestnetworks.guest_id(id).ip_addr.contains(${val})`
    },
    jointFilter: true,
  }
}

export function getOsTypeFilter () {
  return {
    label: i18n.t('common_302'),
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
  const { label = i18n.t('common_285') } = params
  return {
    label,
    dropdown: true,
    items: [
      { label: i18n.t('common_303'), key: true },
      { label: i18n.t('common_304'), key: false },
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
    label: i18n.t('common_286'),
    filter: true,
    dropdown: true,
    multiple: true,
    items: [
      { label: i18n.t('common_287'), key: 'account_domain' },
      { label: i18n.t('common_288'), key: 'system' },
      { label: i18n.t('common_289'), key: 'provider_domain' },
    ],
    formatter: val => {
      return `share_mode.contains("${val}")`
    },
  }
}

export function getHostFilter () {
  return {
    label: i18n.t('common_305'),
    filter: true,
    jointFilter: true,
    formatter: val => {
      return `hosts.id(host_id).name.in(${val})`
    },
    hidden: () => store.getters.isProjectMode,
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
      type: 'extra_field',
      key: 'domain',
    },
    hidden: () => store.getters.isProjectMode,
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

export function getVpcFilter () {
  return {
    label: 'VPC',
    dropdown: true,
    distinctField: {
      type: 'extra_field',
      key: 'vpc',
    },
    hidden: () => store.getters.isProjectMode,
  }
}

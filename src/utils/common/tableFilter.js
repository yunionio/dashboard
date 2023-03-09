import * as R from 'ramda'
import moment from 'moment'
import store from '@/store'
import i18n from '@/locales'
import { Manager } from '@/utils/manager'
import { HYPERVISORS_MAP } from '@/constants'
import { HOST_CPU_ARCHS } from '@/constants/compute'
import setting from '@/config/setting'

export function getBrandItems (key = 'brands', outBrands = []) {
  let brands = store.getters.capability[key] || []
  if (store.getters.capability[`disabled_${key}`]) {
    brands = brands.concat(store.getters.capability[`disabled_${key}`] || [])
    brands = R.uniq(brands)
  }
  if (store.getters.capability[`read_only_${key}`]) {
    brands = brands.concat(store.getters.capability[`read_only_${key}`] || [])
    brands = R.uniq(brands)
  }
  if (store.getters.capability[`read_only_disabled_${key}`]) {
    brands = brands.concat(store.getters.capability[`read_only_disabled_${key}`] || [])
    brands = R.uniq(brands)
  }
  return brands.map(item => {
    const brandConfig = HYPERVISORS_MAP[item.toLowerCase()] || {}
    const obj = { key: item, label: brandConfig.label || item }
    if (obj.label === 'OneCloud') {
      obj.label = i18n.t('brand')
    }
    if (obj.key === 'Cloudpods') {
      const { companyInfo = {} } = store.state.app
      obj.label = setting.language === 'en' ? (companyInfo.inner_copyright_en || obj.label) : (companyInfo.inner_copyright || obj.label)
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

export function getNameFilter ({ field = 'name', label = i18n.t('table.title.name') } = {}) {
  return {
    label,
    filter: true,
    formatter: val => {
      return `${field}.contains('${val}')`
    },
  }
}

export function getBrandFilter (key, outBrands) {
  return {
    label: i18n.t('table.title.brand'),
    dropdown: true,
    multiple: true,
    items: getBrandItems(key, outBrands),
  }
}

// 对符合条件的系统的Brand进行二次过滤，只选择传入的支持的平台
export function getInBrandFilter (key, inBrands = []) {
  return {
    label: i18n.t('table.title.brand'),
    dropdown: true,
    multiple: true,
    items: getBrandItems(key, null).filter(v => inBrands.indexOf(v.key) > -1),
  }
}

export function getStatusFilter (params) {
  let label = i18n.t('common.status')
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
    label: i18n.t('res.project'),
    dropdown: true,
    multiple: true,
    distinctField: {
      type: 'extra_field',
      key: 'tenant',
    },
  }
}

export function getAccountFilter ({ label = i18n.t('res.cloudaccount'), distinctType = 'extra_field', field = 'account', formatter } = {}) {
  const options = {
    label,
    dropdown: true,
    multiple: true,
    distinctField: {
      type: distinctType,
      key: field,
    },
    mapper: data => {
      return data.map(item => {
        if (item.label && item.label === 'OneStack') {
          item.label = setting.brand.en || item.label
        }
        return item
      })
    },
    hidden: () => store.getters.isProjectMode,
  }
  if (formatter) {
    options.filter = true
    options.formatter = formatter
  }
  return options
}

export function getCloudProviderFilter () {
  return {
    label: i18n.t('compute.text_653'),
    dropdown: true,
    multiple: false,
    distinctField: {
      type: 'extra_field',
      key: 'manager',
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
    label: i18n.t('table.title.os'),
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
  const { label = i18n.t('table.title.enable_status') } = params
  return {
    label,
    dropdown: true,
    items: [
      { label: i18n.t('status.enabled.true'), key: true },
      { label: i18n.t('status.enabled.false'), key: false },
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
    label: i18n.t('res.host'),
    filter: true,
    jointFilter: true,
    formatter: val => {
      return `hosts.id(host_id).name.contains(${val})`
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

export function getDomainFilter (domain_key = 'domain') {
  return {
    label: i18n.t('table.title.domain'),
    dropdown: true,
    multiple: true,
    distinctField: {
      type: 'extra_field',
      key: domain_key,
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

export const getOsArchFilter = (isCapabilityKey = false) => {
  let items = Object.values(HOST_CPU_ARCHS)
  if (isCapabilityKey) items = items.map(obj => ({ key: obj.capabilityKey, label: obj.label }))
  return {
    label: i18n.t('table.title.os_arch'),
    dropdown: true,
    items,
  }
}

export function getRegionFilter () {
  return {
    label: i18n.t('res.region'),
    dropdown: true,
    distinctField: {
      type: 'extra_field',
      key: 'region',
      afterFetch: async (items, extraParams = {}) => {
        if (items.length === 0) {
          return items
        }

        try {
          const params = {
            'filter.0': `name.in(${items.map(item => { return `"${item}"` }).join(',')})`,
            order_by: 'name',
            ...extraParams,
          }
          const manager = new Manager('cloudregions', 'v2')
          const { data: { data = [] } } = await manager.list({
            params,
          })

          return data.map((region) => {
            if (region._i18n && region._i18n.name) {
              return { key: region.id, label: region._i18n.name }
            } else {
              return { key: region.id, label: region.name }
            }
          })
        } catch (error) {
          return error
        }
      },
    },
  }
}

export function distinctFieldFilter ({ service = '', field = '', multiple = true } = {}) {
  return {
    label: i18n.t(`${service}.title.${field}`),
    dropdown: true,
    multiple: multiple,
    distinctField: {
      type: 'field',
      key: `${field}`,
    },
  }
}

export function getSuccessFilter (params = {}) {
  const { label = i18n.t('table.title.operation_status') } = params
  return {
    label,
    dropdown: true,
    items: [
      { label: i18n.t('operation.success.true'), key: true },
      { label: i18n.t('operation.success.false'), key: false },
    ],
  }
}

function utcTime (v) {
  return moment(v).utc().format('YYYY-MM-DD HH:mm:ss')
}

function time (v) {
  return moment(v).format('YYYY-MM-DD HH:mm:ss')
}

export function getTimeRangeFilter ({ label = '', field = '' }) {
  return {
    label: label,
    dropdown: true,
    date: true,
    filter: true,
    formatter: (val, type) => {
      if (type === 'before') {
        return `${field}.le("${utcTime(val)}")`
      }
      if (type === 'after') {
        return `${field}.ge("${utcTime(val)}")`
      }
      return `${field}.between("${utcTime(val[0])}", "${utcTime(val[1])}")`
    },
  }
}

export function getCreatedAtFilter ({ field = 'created_at', utc = true } = {}) {
  return {
    label: i18n.t('common.createdAt'),
    dropdown: true,
    date: true,
    filter: true,
    formatter: (val, type) => {
      if (type === 'before') {
        return `${field}.le("${utc ? utcTime(val) : time(val)}")`
      }
      if (type === 'after') {
        return `${field}.ge("${utc ? utcTime(val) : time(val)}")`
      }
      return `${field}.between("${utc ? utcTime(val[0]) : time(val[0])}", "${utc ? utcTime(val[1]) : time[1]}")`
    },
  }
}

export function getResourceTypeFilter ({ label = i18n.t('common.text_73'), field = 'resource_type', multiple = true, distinctType = 'field' } = {}) {
  return {
    label,
    dropdown: true,
    multiple,
    distinctField: {
      type: distinctType,
      key: field,
    },
    mapper: (data) => {
      return data.map(item => {
        return {
          key: item.key,
          label: i18n.te(`bill_resource_type.${item.key}`) ? i18n.t(`bill_resource_type.${item.key}`) : item.key,
        }
      })
    },
  }
}

export function getImageDistributionFilter () {
  return {
    label: i18n.t('table.title.os'),
    dropdown: true,
    multiple: true,
    items: [
      { label: 'Windows', key: 'Windows' },
      { label: 'CentOS', key: 'CentOS' },
      { label: 'Ubuntu', key: 'Ubuntu' },
      { label: 'Debian', key: 'Debian' },
      { label: 'ArchLinux', key: 'ArchLinux' },
      { label: 'OpenEuler', key: 'OpenEuler' },
      { label: 'Suse', key: 'Suse' },
      { label: 'CoreOS', key: 'CoreOS' },
      { label: 'FreeBSD', key: 'FreeBSD' },
      { label: 'Linux', key: 'Linux' },
      { label: 'VMWare', key: 'VMWare' },
    ],
  }
}

export function getDescriptionFilter (params = {}) {
  const { label = i18n.t('table.title.desc'), field = 'description' } = params
  return {
    label,
    filter: true,
    formatter: val => {
      return `${field}.contains('${val}')`
    },
  }
}

export function getGuestStatusFilter () {
  return {
    label: i18n.t('compute.guest.status'),
    dropdown: true,
    multiple: true,
    distinctField: {
      type: 'extra_field',
      key: 'guest_status',
    },
    mapper: data => {
      return mapperStatusToItems(data, 'server')
    },
  }
}

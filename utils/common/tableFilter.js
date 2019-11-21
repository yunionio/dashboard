import * as R from 'ramda'
import store from '@/store'
import i18n from '@/locales'

export function getBrandItems (key = 'brands') {
  return (store.getters.capability[key] || []).map(item => ({ key: item, label: item }))
}

export function mapperStatusToItems (items, statusModule) {
  const status = i18n.t(statusModule)
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

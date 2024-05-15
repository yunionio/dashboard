import get from 'lodash/get'
import * as R from 'ramda'
import i18n from '@/locales'

function getI18nfromRow (data, key = 'name', i18nKey = '_i18n') {
  return get(data, `${i18nKey}.${key}`, data[key])
}

const getI18n = (key, value) => {
  if (i18n.te(key)) {
    return i18n.t(key)
  }
  return value
}

const getI18nWithDefault = (key, defaultValue) => {
  const keys = R.is(Array, key) ? key : [key]
  let value = defaultValue === undefined ? keys[0] : defaultValue
  for (let i = 0; i < keys.length; i++) {
    if (i18n.te(keys[i])) {
      value = i18n.t(keys[i])
      return value
    }
  }
  return value
}

export default {
  install (Vue) {
    Vue.prototype._$t = getI18nfromRow
    Vue.prototype._$te = getI18n
    Vue.prototype.$getI18n = getI18nWithDefault
  },
}

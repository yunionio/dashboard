import get from 'lodash/get'
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

export default {
  install (Vue) {
    Vue.prototype._$t = getI18nfromRow
    Vue.prototype._$te = getI18n
  },
}

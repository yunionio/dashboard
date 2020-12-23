import get from 'lodash/get'

function getI18nfromRow (data, key = 'name', i18nKey = '_i18n') {
  return get(data, `${i18nKey}.${key}`, data[key])
}

export default {
  install (Vue) {
    Vue.prototype._$t = getI18nfromRow
  },
}

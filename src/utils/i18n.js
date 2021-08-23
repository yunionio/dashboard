import i18n from '@/locales'
import { getLanguage } from '@/utils/common/cookie'

export const getI18n = (key, value) => {
  if (i18n.te(key)) {
    return i18n.t(key)
  }
  return value
}

export const getI18nVal = (source = {}, key, i18nKey = '_en') => {
  if (getLanguage() === 'en') {
    return source[`${key}${i18nKey}`]
  }
  return source[key]
}

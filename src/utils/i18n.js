import i18n from '@/locales'

export const getI18n = (key, value) => {
  if (i18n.te(key)) {
    return i18n.t(key)
  }
  return value
}

import i18n from '@/locales'

export const checkReadOnly = (data, action) => {
  const READ_ONLY_BRAND = ['Aws']
  const ret = { validate: true }

  if (Array.isArray(data)) {
    for (const obj of data) {
      if (READ_ONLY_BRAND.includes(obj.brand)) {
        ret.validate = false
        ret.tooltip = i18n.t('common.check_readonly', [obj.brand, action])
        break
      }
    }
  } else {
    if (READ_ONLY_BRAND.includes(data.brand)) {
      ret.validate = false
      ret.tooltip = i18n.t('common.check_readonly', [data.brand, action])
    }
  }
  return ret
}

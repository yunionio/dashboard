import { PROVIDER_MAP } from '@/constants'
import i18n from '@/locales'

const validateProvider = (rows) => {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const notSupport = ['huawei', 'aws', 'qcloud'].includes(row.provider.toLowerCase())
    // eslint-disable-next-line no-undef
    const label = notSupport ? _.get(PROVIDER_MAP, `[${row.provider}].label`) : ''
    const tooltip = label ? i18n.t('network.text_309', [label]) : ''
    if (notSupport) {
      return {
        validate: false,
        tooltip,
      }
    }
  }
  return {
    validate: true,
  }
}

export function validateEnabled (rows) {
  const rowItem = rows[0]
  if (rows.length === 1 && rowItem.status === 'enabled') {
    return {
      validate: false,
      tooltip: i18n.t('network.text_310'),
    }
  }
  return {
    validate: true,
    ...validateProvider(rows),
  }
}

export function validateDisable (rows) {
  const rowItem = rows[0]
  if (rows.length === 1 && rowItem.status === 'disabled') {
    return {
      validate: false,
      tooltip: i18n.t('network.text_311'),
    }
  }
  return {
    validate: true,
    ...validateProvider(rows),
  }
}

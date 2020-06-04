import { PROVIDER_MAP } from '@/constants'

const validateProvider = (rows) => {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const notSupport = ['huawei', 'aws', 'qcloud'].includes(row.provider.toLowerCase())
    // eslint-disable-next-line no-undef
    const label = notSupport ? _.get(PROVIDER_MAP, `[${row.provider}].label`) : ''
    const tooltip = label ? `【${label}】暂不支持该操作` : ''
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
      tooltip: '启用状态下不支持此操作',
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
      tooltip: '禁用状态下不支持此操作',
    }
  }
  return {
    validate: true,
    ...validateProvider(rows),
  }
}

/**
 * 错误详情展示前的敏感信息脱敏：
 * 对请求 data/params/headers/url query 中字段名命中敏感模式的字段值统一打码，
 * 避免密码、token、密钥等随错误详情回显到页面
 */

// 敏感字段名模式（不区分大小写）：密码、token、密钥、认证头、cookie
const SENSITIVE_KEY_REG = /passwd|password|pwd|token|secret|access_key|apikey|api_key|credential|authorization|cookie/i

const MASKED_VALUE = '******'

const maskValueByKey = (key, value) => {
  if (SENSITIVE_KEY_REG.test(String(key))) return MASKED_VALUE
  if (Array.isArray(value)) {
    return value.map(item => maskSensitiveData(item))
  }
  if (value && typeof value === 'object') {
    return maskSensitiveData(value)
  }
  return value
}

/**
 * 递归打码对象中敏感字段的值
 * @param {Object} obj 任意对象（字符串/数字等原样返回）
 * @returns {Object} 脱敏后的新对象
 */
export const maskSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  const ret = {}
  Object.keys(obj).forEach(key => {
    ret[key] = maskValueByKey(key, obj[key])
  })
  return ret
}

/**
 * 打码 URL query string 中敏感参数的值
 * @param {String} url 完整 URL
 * @returns {String} 脱敏后的 URL
 */
export const maskSensitiveUrlQuery = (url) => {
  if (typeof url !== 'string') return url
  const idx = url.indexOf('?')
  if (idx < 0) return url
  const base = url.slice(0, idx)
  const parts = url.slice(idx + 1).split('&').map((part) => {
    const eqIdx = part.indexOf('=')
    if (eqIdx < 0) return part
    const key = part.slice(0, eqIdx)
    if (SENSITIVE_KEY_REG.test(key)) return `${key}=${MASKED_VALUE}`
    return part
  })
  return `${base}?${parts.join('&')}`
}

/**
 * 旧版（/）→ 新版（/v2）整页跳转
 */

/** 是否展示版本切换、按次技术支持购买、升级/降级企业版等相关入口 */
export const SHOW_SWITCH_VERSION = String(process.env.VUE_APP_SHOW_SWITCH_VERSION || '').toLowerCase() === 'true'

const rawPrefix = String(process.env.VUE_APP_NEW_VERSION_PREFIX || '/v2').trim()
export const NEW_VERSION_PREFIX =
  !rawPrefix || rawPrefix === '/'
    ? ''
    : `/${rawPrefix.replace(/^\/+|\/+$/g, '')}`

/** 可选：新版应用根（默认同 origin + 前缀） */
export const NEW_APP_URL = (process.env.VUE_APP_NEW_APP_URL || '').replace(/\/+$/, '')

/** 保留当前 path + query + hash，前缀 /v2 */
export function buildNewVersionUrl (fullPath = '/') {
  const fp = fullPath && fullPath.startsWith('/') ? fullPath : `/${fullPath || ''}`
  const base = NEW_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  if (!base) return ''
  if (!NEW_VERSION_PREFIX) return `${base}${fp}`
  return `${base}${NEW_VERSION_PREFIX}${fp === '/' ? '/' : fp}`
}

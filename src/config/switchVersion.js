/**
 * 旧版（/）→ 新版（/v2）整页跳转；localStorage 记住用户版本偏好
 */

/** 是否展示版本切换、按次技术支持购买、升级/降级企业版等相关入口 */
export const SHOW_SWITCH_VERSION = String(process.env.VUE_APP_SHOW_SWITCH_VERSION || '').toLowerCase() === 'true'

export const SELECTED_VERSION_STORAGE_KEY = '__oc_selected_version__'

const rawPrefix = String(process.env.VUE_APP_NEW_VERSION_PREFIX || '/v2').trim()
export const NEW_VERSION_PREFIX =
  !rawPrefix || rawPrefix === '/'
    ? ''
    : `/${rawPrefix.replace(/^\/+|\/+$/g, '')}`

/** 可选：新版应用根（默认同 origin + 前缀） */
export const NEW_APP_URL = (process.env.VUE_APP_NEW_APP_URL || '').replace(/\/+$/, '')

export function getSelectedVersionPrefix () {
  if (typeof window === 'undefined') return null
  try {
    const v = window.localStorage.getItem(SELECTED_VERSION_STORAGE_KEY)
    if (v === '/' || v === '/v2') return v
  } catch (e) { /* ignore */ }
  return null
}

export function setSelectedVersionPrefix (prefix) {
  if (typeof window === 'undefined') return
  if (prefix !== '/' && prefix !== '/v2') return
  try {
    window.localStorage.setItem(SELECTED_VERSION_STORAGE_KEY, prefix)
  } catch (e) { /* ignore */ }
}

export function isPathnameOnV2 (pathname = typeof window !== 'undefined' ? window.location.pathname : '/') {
  const p = pathname || '/'
  const mark = NEW_VERSION_PREFIX || '/v2'
  return p === mark || p === `${mark}/` || p.startsWith(`${mark}/`)
}

/** 仅 pathname：去掉新版挂载前缀 */
export function stripV2PathnamePrefix (pathname = '/') {
  const p = pathname && pathname.startsWith('/') ? pathname : `/${pathname || ''}`
  const mark = NEW_VERSION_PREFIX || '/v2'
  if (!mark) return p
  if (p === mark || p === `${mark}/`) return '/'
  if (p.startsWith(`${mark}/`)) {
    const rest = p.slice(mark.length)
    return rest && rest.startsWith('/') ? rest : `/${rest}`
  }
  return p
}

/** 仅 pathname：加上新版挂载前缀 */
export function withV2PathnamePrefix (pathname = '/') {
  const mark = NEW_VERSION_PREFIX || '/v2'
  const bare = stripV2PathnamePrefix(pathname)
  if (!mark) return bare
  if (bare === '/') return `${mark}/`
  return `${mark}${bare.startsWith('/') ? bare : `/${bare}`}`
}

export function splitFullPath (fullPath = '/') {
  const raw = fullPath && fullPath.startsWith('/') ? fullPath : `/${fullPath || ''}`
  let pathname = raw
  let search = ''
  let hash = ''
  const hashIdx = pathname.indexOf('#')
  if (hashIdx >= 0) {
    hash = pathname.slice(hashIdx)
    pathname = pathname.slice(0, hashIdx)
  }
  const qIdx = pathname.indexOf('?')
  if (qIdx >= 0) {
    search = pathname.slice(qIdx)
    pathname = pathname.slice(0, qIdx)
  }
  return { pathname, search, hash }
}

/** 首屏补救：与 public/oc-version-redirect.js 同规则（同源只改前缀） */
export function redirectIfSelectedVersionMismatch () {
  if (typeof window === 'undefined') return
  const selected = getSelectedVersionPrefix()
  if (!selected) return
  const { pathname, search, hash } = splitFullPath(
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  )
  const onV2 = isPathnameOnV2(pathname)
  const wantsV2 = selected === '/v2'
  if (wantsV2 === onV2) return
  const nextPathname = wantsV2 ? withV2PathnamePrefix(pathname) : stripV2PathnamePrefix(pathname)
  const target = `${nextPathname}${search}${hash}`
  const current = `${pathname}${search}${hash}`
  if (target !== current) window.location.replace(target)
}

/** 去掉 fullPath 上的新版前缀，得到与旧版对齐的 path */
export function stripNewVersionPublicPrefix (fullPath = '/') {
  const { pathname, search, hash } = splitFullPath(fullPath)
  return `${stripV2PathnamePrefix(pathname)}${search}${hash}`
}

/** 保留当前 path + query + hash，前缀 /v2（或 NEW_VERSION_PREFIX） */
export function buildNewVersionUrl (fullPath = '/') {
  const fp = fullPath && fullPath.startsWith('/') ? fullPath : `/${fullPath || ''}`
  const base = NEW_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  if (!base) return ''
  const inner = stripNewVersionPublicPrefix(fp)
  const { pathname, search, hash } = splitFullPath(inner)
  const pathPart = withV2PathnamePrefix(pathname) + search + hash
  if (!NEW_VERSION_PREFIX && !NEW_APP_URL) return `${base}${pathPart}`
  return `${base}${pathPart}`
}

/** 尝鲜 / 切换新版：写入偏好并跳转 */
export function navigateToV2 (fullPath) {
  setSelectedVersionPrefix('/v2')
  if (typeof window === 'undefined') return
  const fp = fullPath || `${window.location.pathname}${window.location.search}${window.location.hash}`
  window.location.href = buildNewVersionUrl(fp)
}

/** 切回旧版：写入偏好并跳转旧版根（同源去掉前缀） */
export function navigateToLegacy (fullPath) {
  setSelectedVersionPrefix('/')
  if (typeof window === 'undefined') return
  const fp = fullPath || `${window.location.pathname}${window.location.search}${window.location.hash}`
  const pathForLegacy = stripNewVersionPublicPrefix(fp)
  const pathOnly = pathForLegacy.startsWith('/') ? pathForLegacy : `/${pathForLegacy}`
  window.location.href = `${window.location.origin}${pathOnly}`
}

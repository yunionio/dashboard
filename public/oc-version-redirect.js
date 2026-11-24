/**
 * 首屏根据 localStorage.__oc_selected_version__（'/' | '/v2'）在同源下只调整路径前缀。
 * 无设置、或当前路径已匹配偏好时不跳转。
 * 偏好旧版且当前在 /v2：若配置了旧版根 URL 且与当前站点不同源，整页跳到旧版根（避免 dev 下 / ↔ /v2 302 死循环）。
 * 开发环境默认不跳转，由构建注入 window.__OC_VERSION_REDIRECT_ENABLED__；线上为 true。
 */
;(function ocVersionRedirect () {
  var STORAGE_KEY = '__oc_selected_version__'
  var V2_MARK = '/v2'

  function readSelected () {
    try {
      var v = localStorage.getItem(STORAGE_KEY)
      if (v === '/' || v === V2_MARK) return v
    } catch (e) { /* ignore */ }
    return null
  }

  function onV2 (pathname) {
    return pathname === V2_MARK || pathname === V2_MARK + '/' || pathname.indexOf(V2_MARK + '/') === 0
  }

  function stripV2 (pathname) {
    if (pathname === V2_MARK || pathname === V2_MARK + '/') return '/'
    if (pathname.indexOf(V2_MARK + '/') === 0) {
      var rest = pathname.slice(V2_MARK.length)
      return rest && rest.charAt(0) === '/' ? rest : '/' + rest
    }
    return pathname
  }

  function withV2 (pathname) {
    var bare = stripV2(pathname || '/')
    if (bare === '/') return V2_MARK + '/'
    return V2_MARK + (bare.charAt(0) === '/' ? bare : '/' + bare)
  }

  function readLegacyAppBase () {
    try {
      return String(window.__OC_LEGACY_APP_URL__ || '').trim()
    } catch (e) {
      return ''
    }
  }

  function legacyOrigin (base) {
    if (!base) return ''
    try {
      return new URL(base, location.origin).origin
    } catch (e) {
      return ''
    }
  }

  function buildLegacyHref (base, pathname, search, hash) {
    var root = String(base || '').replace(/\/+$/, '')
    if (!root) return ''
    var path = pathname && pathname.charAt(0) === '/' ? pathname : '/' + (pathname || '')
    return root + path + (search || '') + (hash || '')
  }

  function isOcVersionRedirectEnabled () {
    try {
      if (typeof window.__OC_VERSION_REDIRECT_ENABLED__ === 'boolean') {
        return window.__OC_VERSION_REDIRECT_ENABLED__
      }
    } catch (e) { /* ignore */ }
    return true
  }

  if (!isOcVersionRedirectEnabled()) return

  var selected = readSelected()
  if (!selected) return

  var pathname = location.pathname || '/'
  var search = location.search || ''
  var hash = location.hash || ''
  var wantsV2 = selected === V2_MARK
  var isV2 = onV2(pathname)
  if (wantsV2 === isV2) return

  var nextPathname = wantsV2 ? withV2(pathname) : stripV2(pathname)
  var target = nextPathname + search + hash
  var current = pathname + search + hash
  if (target === current) return

  if (!wantsV2 && isV2) {
    var legacyBase = readLegacyAppBase()
    var legOrigin = legacyOrigin(legacyBase)
    if (legOrigin && legOrigin !== location.origin) {
      var legacyHref = buildLegacyHref(legacyBase, nextPathname, search, hash)
      if (legacyHref) {
        location.replace(legacyHref)
        return
      }
    }
  }

  location.replace(target)
})()

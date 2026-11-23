/**
 * 首屏根据 localStorage.__oc_selected_version__（'/' | '/v2'）在同源下只调整路径前缀。
 * 无设置、或当前路径已匹配偏好时不跳转。
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

  var selected = readSelected()
  if (!selected) return

  var pathname = location.pathname || '/'
  var wantsV2 = selected === V2_MARK
  var isV2 = onV2(pathname)
  if (wantsV2 === isV2) return

  var nextPathname = wantsV2 ? withV2(pathname) : stripV2(pathname)
  var target = nextPathname + (location.search || '') + (location.hash || '')
  var current = pathname + (location.search || '') + (location.hash || '')
  if (target !== current) location.replace(target)
})()

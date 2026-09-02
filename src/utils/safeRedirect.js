/**
 * 登录回跳地址（rf/path）安全校验
 * 服务端通过 cors_hosts 配置跨域白名单：
 * - cors_hosts 为空：仅阻断危险协议（策略2）
 * - cors_hosts 非空：额外启用跨域白名单校验（策略1）
 */

/**
 * 归一化服务端 cors_hosts 配置（支持数组或逗号分隔字符串，可带协议前缀）
 * 条目可以是 ip、域名（精确匹配）、含 * 通配符的 ip/域名、或单独 *
 * @param {Array|String} corsHosts 服务端 cors_hosts 配置
 * @returns {Array} 小写、无协议、无尾部斜杠的条目列表
 */
export const normalizeCorsHosts = (corsHosts) => {
  const list = Array.isArray(corsHosts)
    ? corsHosts
    : (typeof corsHosts === 'string' && corsHosts ? corsHosts.split(',') : [])
  return list
    .map(host => String(host).trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/\/+$/, ''))
    .filter(Boolean)
}

const escapeRegExp = (str) => str.replace(/[.+?^${}()|[\]\\]/g, '\\$&')

/**
 * 主机名是否匹配 cors_hosts 条目：
 * - 不含 *：精确匹配
 * - 含 *：* 匹配任意字符串（*.example.com 匹配 a.example.com、a.b.example.com；
 *   192.168.* 匹配 192.168.1.2 等），即只匹配 * 前后的字符串
 * - 单独 *：匹配所有
 * 域名不区分大小写（条目已归一化为小写）
 * @param {String} hostname 待校验主机名（小写，不含端口）
 * @param {String} entry 白名单条目（已归一化）
 * @returns {Boolean}
 */
const hostMatchesCorsEntry = (hostname, entry) => {
  if (entry === '*') return true
  if (!entry.includes('*')) return hostname === entry
  const pattern = entry.split('*').map(escapeRegExp).join('.*')
  return new RegExp(`^${pattern}$`, 'i').test(hostname)
}

/**
 * 校验登录回跳地址（rf/path）是否安全：
 * 1. 拒绝 javascript:/data:/vbscript:/file: 等非 http(s) 协议
 * 2. 拒绝协议相对地址（//、\\、/\ 开头）
 * 3. corsHosts 非空时启用跨域白名单：外链主机名必须匹配白名单条目
 *    （ip/域名精确匹配、含 * 通配符条目、单独 * 匹配所有）或为当前站点主机名；
 *    相对路径（同源跳转）不受白名单限制
 * @param {String} url 待校验的回跳地址
 * @param {Array|String} corsHosts 服务端 cors_hosts 配置
 * @returns {String} 安全则返回原值，否则返回空字符串
 */
export const safeAuthRedirectUrl = (url, corsHosts = []) => {
  if (typeof url !== 'string') return ''
  const target = url.trim()
  if (!target) return ''
  // 协议相对地址可跳转到任意外域，且无任何合法使用场景，直接拒绝
  if (/^[\\/]{2}|^\/\\/.test(target)) return ''
  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(target)
  if (schemeMatch) {
    // 带协议时仅允许 http(s)
    if (!/^https?$/i.test(schemeMatch[1])) return ''
    // 白名单校验（仅对 http(s) 外链生效）
    const hosts = normalizeCorsHosts(corsHosts)
    if (hosts.length) {
      const hostMatch = /^https?:\/\/([^/?#]+)/i.exec(target)
      let hostname = hostMatch && hostMatch[1].toLowerCase()
      if (!hostname) return ''
      // 去掉端口（IPv6 字面量除外）
      if (!hostname.startsWith('[')) {
        const colonIdx = hostname.indexOf(':')
        if (colonIdx > -1) hostname = hostname.slice(0, colonIdx)
      }
      const currentHost = (window.location.hostname || '').toLowerCase()
      if (hostname !== currentHost && !hosts.some(entry => hostMatchesCorsEntry(hostname, entry))) return ''
    }
  }
  return url
}

/**
 * 过滤透传给 SSO 重定向端点的 query string：
 * 移除未通过安全校验的 rf/path 参数，避免危险值透传后端
 * @param {String} search 当前页面 query string（可带 '?'）
 * @param {Array|String} corsHosts 服务端 cors_hosts 配置
 * @returns {String} 过滤后的 query string（含 '?'；无剩余参数时为空字符串）
 */
export const sanitizeSsoRedirectSearch = (search = '', corsHosts = []) => {
  if (!search) return ''
  const parts = String(search).replace(/^\?/, '').split('&')
  const kept = parts.filter((part) => {
    if (!part) return false
    const eqIdx = part.indexOf('=')
    let key = eqIdx > -1 ? part.slice(0, eqIdx) : part
    try {
      key = decodeURIComponent(key)
    } catch (e) {
      // 无法解码的参数名保留，由后端处理
    }
    if (key.toLowerCase() === 'rf' || key.toLowerCase() === 'path') {
      const rawVal = eqIdx > -1 ? part.slice(eqIdx + 1) : ''
      let val = rawVal
      try {
        val = decodeURIComponent(rawVal)
      } catch (e) {
        // 值无法解码，按不安全处理
        return false
      }
      return !!safeAuthRedirectUrl(val, corsHosts)
    }
    return true
  })
  return kept.length ? '?' + kept.join('&') : ''
}

/**
 * 获取服务端 cors_hosts 跨域白名单；auth/regions 尚未加载时触发拉取
 * @param {Object} store vuex store 实例
 * @returns {Promise<Array|String>} cors_hosts 配置；获取失败时返回空数组（等价于未配置）
 */
export const getAuthRedirectCorsHosts = async (store) => {
  try {
    const regions = store?.getters?.auth?.regions || {}
    if (!Array.isArray(regions.regions) || !regions.regions.length) {
      await store?.dispatch('auth/getRegions')
    }
    return store?.getters?.auth?.regions?.cors_hosts || []
  } catch (error) {
    return []
  }
}

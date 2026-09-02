import {
  safeAuthRedirectUrl,
  normalizeCorsHosts,
  sanitizeSsoRedirectSearch,
} from '@/utils/safeRedirect'

const CURRENT_HOST = window.location.hostname // jsdom 默认 localhost

describe('safeAuthRedirectUrl', () => {
  it('corsHosts 为空时仅阻断危险协议（策略2）', () => {
    // 允许 http(s) 外链
    expect(safeAuthRedirectUrl('https://evil.com')).toBe('https://evil.com')
    expect(safeAuthRedirectUrl('http://evil.com/x?y=1')).toBe('http://evil.com/x?y=1')
    // 相对路径（同源跳转）始终允许
    expect(safeAuthRedirectUrl('/dashboard')).toBe('/dashboard')
    expect(safeAuthRedirectUrl('dashboard')).toBe('dashboard')
    // 阻断危险协议
    expect(safeAuthRedirectUrl('javascript:alert(1)')).toBe('')
    expect(safeAuthRedirectUrl('JavaScript:alert(1)')).toBe('')
    expect(safeAuthRedirectUrl('  javascript:alert(document.cookie)')).toBe('')
    expect(safeAuthRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe('')
    expect(safeAuthRedirectUrl('vbscript:msgbox(1)')).toBe('')
    expect(safeAuthRedirectUrl('file:///etc/passwd')).toBe('')
    // 阻断协议相对地址
    expect(safeAuthRedirectUrl('//evil.com')).toBe('')
    expect(safeAuthRedirectUrl('\\\\evil.com')).toBe('')
    expect(safeAuthRedirectUrl('/\\evil.com')).toBe('')
    // 非法输入
    expect(safeAuthRedirectUrl('')).toBe('')
    expect(safeAuthRedirectUrl(null)).toBe('')
    expect(safeAuthRedirectUrl(123)).toBe('')
  })

  it('corsHosts 非空时启用跨域白名单：ip/域名精确匹配（策略1）', () => {
    const corsHosts = ['console.yun.io', '192.168.1.10']
    // 白名单内精确匹配
    expect(safeAuthRedirectUrl('https://console.yun.io/x', corsHosts)).toBe('https://console.yun.io/x')
    expect(safeAuthRedirectUrl('https://192.168.1.10/x', corsHosts)).toBe('https://192.168.1.10/x')
    // 域名大小写不敏感
    expect(safeAuthRedirectUrl('https://CONSOLE.YUN.IO/x', corsHosts)).toBe('https://CONSOLE.YUN.IO/x')
    // 当前站点同域
    expect(safeAuthRedirectUrl(`https://${CURRENT_HOST}/x`, corsHosts)).toBe(`https://${CURRENT_HOST}/x`)
    // 端口不影响主机名校验
    expect(safeAuthRedirectUrl(`https://${CURRENT_HOST}:8080/x`, corsHosts)).toBe(`https://${CURRENT_HOST}:8080/x`)
    // 白名单外阻断
    expect(safeAuthRedirectUrl('https://evil.com', corsHosts)).toBe('')
    // 普通域名条目不继承子域名（需精确匹配）
    expect(safeAuthRedirectUrl('https://sub.console.yun.io/x', corsHosts)).toBe('')
    // 相似域名绕过尝试
    expect(safeAuthRedirectUrl('https://console.yun.io.evil.com', corsHosts)).toBe('')
    expect(safeAuthRedirectUrl('https://evilconsole.yun.io', corsHosts)).toBe('')
  })

  it('corsHosts 含 * 通配符条目：只匹配 * 前后的字符串', () => {
    const corsHosts = ['*.console.yun.io', '192.168.*', '*.yun.cn']
    // 域名通配：匹配任意层级子域名
    expect(safeAuthRedirectUrl('https://sub.console.yun.io/x', corsHosts)).toBe('https://sub.console.yun.io/x')
    expect(safeAuthRedirectUrl('https://a.b.console.yun.io/x', corsHosts)).toBe('https://a.b.console.yun.io/x')
    // 通配符不含点，不匹配裸域
    expect(safeAuthRedirectUrl('https://console.yun.io/x', corsHosts)).toBe('')
    // ip 网段通配
    expect(safeAuthRedirectUrl('https://192.168.1.2/x', corsHosts)).toBe('https://192.168.1.2/x')
    expect(safeAuthRedirectUrl('https://10.0.0.1/x', corsHosts)).toBe('')
    // 任意后缀通配
    expect(safeAuthRedirectUrl('https://foo.yun.cn/x', corsHosts)).toBe('https://foo.yun.cn/x')
    expect(safeAuthRedirectUrl('https://foo.yun.cn.evil.com/x', corsHosts)).toBe('')
    // 相似域名绕过尝试
    expect(safeAuthRedirectUrl('https://x.console.yun.io.evil.com/x', corsHosts)).toBe('')
  })

  it('corsHosts 为 "*" 时匹配所有 http(s)，但仍阻断危险协议', () => {
    expect(safeAuthRedirectUrl('https://any.host.com', ['*'])).toBe('https://any.host.com')
    expect(safeAuthRedirectUrl('https://192.168.0.1/x', ['*'])).toBe('https://192.168.0.1/x')
    expect(safeAuthRedirectUrl('javascript:alert(1)', ['*'])).toBe('')
  })
})

describe('normalizeCorsHosts', () => {
  it('支持数组与逗号分隔字符串，并归一化协议与斜杠（保留 * 通配符）', () => {
    expect(normalizeCorsHosts(['https://A.YUN.IO/'])).toEqual(['a.yun.io'])
    expect(normalizeCorsHosts('https://a.yun.io, B.YUN.IO/')).toEqual(['a.yun.io', 'b.yun.io'])
    expect(normalizeCorsHosts('https://*.YUN.IO, 192.168.*, *')).toEqual(['*.yun.io', '192.168.*', '*'])
    expect(normalizeCorsHosts('')).toEqual([])
    expect(normalizeCorsHosts(undefined)).toEqual([])
  })
})

describe('sanitizeSsoRedirectSearch', () => {
  it('移除不安全的 rf/path，保留其余参数', () => {
    const search = '?domain=default&rf=javascript%3Aalert(1)&foo=bar'
    expect(sanitizeSsoRedirectSearch(search)).toBe('?domain=default&foo=bar')
  })
  it('保留安全的 rf', () => {
    expect(sanitizeSsoRedirectSearch('?rf=%2Fdashboard&x=1')).toBe('?rf=%2Fdashboard&x=1')
  })
  it('白名单模式下丢弃未授权的外链 path', () => {
    const search = '?path=https%3A%2F%2Fevil.com&x=1'
    expect(sanitizeSsoRedirectSearch(search, ['console.yun.io'])).toBe('?x=1')
  })
  it('空输入返回空字符串', () => {
    expect(sanitizeSsoRedirectSearch('')).toBe('')
    expect(sanitizeSsoRedirectSearch(undefined)).toBe('')
  })
})

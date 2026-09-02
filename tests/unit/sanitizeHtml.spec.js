import { sanitizeHtml, renderMarkdownSafe } from '@/utils/sanitizeHtml'

describe('sanitizeHtml', () => {
  it('移除事件属性与脚本', () => {
    const html = '<img src=x onerror=alert(1)>'
    const result = sanitizeHtml(html)
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('alert')
  })

  it('移除 javascript: 链接', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    expect(result).not.toContain('javascript:')
    expect(result).toContain('click')
  })

  it('保留常规格式', () => {
    expect(sanitizeHtml('<p><strong>bold</strong><a href="https://example.com">link</a></p>'))
      .toBe('<p><strong>bold</strong><a href="https://example.com">link</a></p>')
  })

  it('空值返回空字符串', () => {
    expect(sanitizeHtml('')).toBe('')
    expect(sanitizeHtml(null)).toBe('')
    expect(sanitizeHtml(undefined)).toBe('')
  })
})

describe('renderMarkdownSafe', () => {
  it('渲染正常 markdown', () => {
    expect(renderMarkdownSafe('**bold**')).toContain('<strong>bold</strong>')
    expect(renderMarkdownSafe('[link](https://example.com)')).toContain('href="https://example.com"')
  })

  it('过滤 markdown 中混入的 HTML 注入', () => {
    const result = renderMarkdownSafe('<img src=x onerror=alert(1)>')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('alert(1)')
  })

  it('过滤 markdown 链接中的 javascript: 协议', () => {
    const result = renderMarkdownSafe('[click](javascript:alert(1))')
    expect(result).not.toContain('javascript:')
  })

  it('空值与 "-" 返回 "-" 占位（与组件原行为一致）', () => {
    expect(renderMarkdownSafe('')).toBe('-')
    expect(renderMarkdownSafe(null)).toBe('-')
    expect(renderMarkdownSafe('-')).toBe('-')
  })
})

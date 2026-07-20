import { normalizeMarkdownTables, splitThinkingContent } from '../chatContent'

describe('normalizeMarkdownTables', () => {
  it('splits compacted pipe rows', () => {
    const input = '| 操作系统 | 数量 ||—|---|| Linux | 37 台 || Windows | 1 台 (win10) || 未标注 | 2 台 |'
    const out = normalizeMarkdownTables(input)
    expect(out).toContain('| 操作系统 | 数量 |')
    expect(out).toContain('|---|---|')
    expect(out).toContain('| Linux | 37 台 |')
    expect(out).toContain('| Windows | 1 台 (win10) |')
    expect(out.split('\n').length).toBeGreaterThanOrEqual(5)
  })

  it('keeps already valid tables', () => {
    const input = [
      '| 规格 | 数量 |',
      '|---|---|',
      '| 1c1g | 5 台 |',
      '| 2c2g | 12 台 |',
    ].join('\n')
    expect(normalizeMarkdownTables(input)).toBe(input)
  })

  it('does not break empty cells written as "| |"', () => {
    const input = '| a | | b |\n|---|---|---|\n| 1 |  | 3 |'
    expect(normalizeMarkdownTables(input)).toBe(input)
  })
})

describe('splitThinkingContent', () => {
  it('splits closed think block', () => {
    expect(splitThinkingContent('<think>r</think>\nhello')).toEqual({
      reasoning: 'r',
      content: 'hello',
    })
  })
})

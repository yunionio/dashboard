import { withClaudeCode1MSuffix } from '../claudeCodeModelId'

describe('withClaudeCode1MSuffix', () => {
  it('appends [1m] when contextWindow is at least 1M', () => {
    expect(withClaudeCode1MSuffix('deepseek-v4-pro', { contextWindow: 1000000 })).toBe(
      'deepseek-v4-pro[1m]',
    )
    expect(withClaudeCode1MSuffix('glm-5.2', { contextWindow: 1000000 })).toBe('glm-5.2[1m]')
    expect(withClaudeCode1MSuffix('gpt-5.6', { contextWindow: 1050000 })).toBe('gpt-5.6[1m]')
  })

  it('appends [1m] to the hierarchical client id', () => {
    expect(withClaudeCode1MSuffix('qj-claude-code-mac/deepseek-v4-pro', {
      contextWindow: 1000000,
    })).toBe('qj-claude-code-mac/deepseek-v4-pro[1m]')
  })

  it('does not append when contextWindow is missing or below 1M', () => {
    expect(withClaudeCode1MSuffix('deepseek-v4-pro')).toBe('deepseek-v4-pro')
    expect(withClaudeCode1MSuffix('gpt-5.2', { contextWindow: 400000 })).toBe('gpt-5.2')
    expect(withClaudeCode1MSuffix('claude-sonnet-4-20250514')).toBe('claude-sonnet-4-20250514')
    expect(withClaudeCode1MSuffix('your-model')).toBe('your-model')
    expect(withClaudeCode1MSuffix('')).toBe('')
  })

  it('does not double-append an existing context suffix', () => {
    expect(withClaudeCode1MSuffix('deepseek-v4-pro[1m]', { contextWindow: 1000000 })).toBe(
      'deepseek-v4-pro[1m]',
    )
    expect(withClaudeCode1MSuffix('qj-claude-code-mac/deepseek-v4-pro[1M]', {
      contextWindow: 1000000,
    })).toBe('qj-claude-code-mac/deepseek-v4-pro[1M]')
  })
})

import {
  DEFAULT_ANTHROPIC_MAX_TOKENS,
  buildAnthropicChatTestRequestConfig,
  resolveAnthropicMaxTokens,
} from '../aiproxyEndpoint'

jest.mock('@/utils/manager', () => ({ Manager: class {} }), { virtual: true })
jest.mock('@Ai/constants/aiproxyResources', () => ({ getAiproxyResourceScope: () => '' }), { virtual: true })

describe('resolveAnthropicMaxTokens', () => {
  it('defaults to 1024 when context is unknown', () => {
    expect(resolveAnthropicMaxTokens()).toBe(DEFAULT_ANTHROPIC_MAX_TOKENS)
    expect(DEFAULT_ANTHROPIC_MAX_TOKENS).toBe(1024)
  })

  it('does not consume a 4096-token vLLM context window', () => {
    expect(resolveAnthropicMaxTokens({
      contextWindow: 4096,
      requested: 4096,
    })).toBeLessThan(4096)
    expect(resolveAnthropicMaxTokens({
      contextWindow: 4096,
    })).toBe(1024)
  })

  it('clamps requested tokens when context is small', () => {
    expect(resolveAnthropicMaxTokens({
      contextWindow: 1024,
      requested: 1024,
    })).toBe(768)
  })
})

describe('buildAnthropicChatTestRequestConfig', () => {
  it('sets a prompt-safe max_tokens', () => {
    const cfg = buildAnthropicChatTestRequestConfig({
      endpoint: 'https://example/ai/anthropic/v1/messages',
      model: 'qwen38-Qwen3.8-27B-NVFP4',
      virtualKey: 'sk-test',
      contextWindow: 4096,
    })
    expect(cfg.body.max_tokens).toBe(1024)
    expect(cfg.protocol).toBe('anthropic')
  })
})

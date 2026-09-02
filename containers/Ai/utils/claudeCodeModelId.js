export const CLAUDE_CODE_1M_CONTEXT_TOKENS = 1000000

const CLAUDE_CODE_CONTEXT_SUFFIX_RE = /\[[\d.]+[mk]\]$/i

/**
 * Append Claude Code's [1m] suffix when contextWindow is at least 1M tokens.
 * Hierarchical ids keep the full path (e.g. route/deepseek-v4-pro[1m]).
 */
export function withClaudeCode1MSuffix (modelId, { contextWindow } = {}) {
  const id = String(modelId || '').trim()
  if (!id || CLAUDE_CODE_CONTEXT_SUFFIX_RE.test(id)) {
    return id
  }
  const n = Number(contextWindow)
  if (Number.isFinite(n) && n >= CLAUDE_CODE_1M_CONTEXT_TOKENS) {
    return `${id}[1m]`
  }
  return id
}

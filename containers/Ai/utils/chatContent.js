const RAW_ERROR_BODY_LIMIT = 2000

/**
 * Pull a human-readable message from an OpenAI / Anthropic error JSON body.
 * Falls back to truncated raw text, then `HTTP {status}`.
 */
export function extractUpstreamErrorMessage (text, status) {
  const raw = String(text || '').trim()
  const code = Number(status)
  const httpFallback = Number.isFinite(code) && code > 0 ? `HTTP ${code}` : ''

  if (raw) {
    try {
      const data = JSON.parse(raw)
      const msg = String(data?.error?.message || data?.message || '').trim()
      if (msg) return msg
    } catch (e) {
      // not JSON
    }
    return raw.length > RAW_ERROR_BODY_LIMIT ? raw.slice(0, RAW_ERROR_BODY_LIMIT) : raw
  }
  return httpFallback || 'HTTP error'
}

export function splitThinkingContent (raw) {
  const text = String(raw || '')
  const closedMatch = text.match(/<(?:redacted_)?think(?:ing)?>([\s\S]*?)<\/(?:redacted_)?think(?:ing)?>\s*([\s\S]*)$/i)
  if (closedMatch) {
    return {
      reasoning: closedMatch[1].trim(),
      content: closedMatch[2].trim(),
    }
  }
  const openMatch = text.match(/<(?:redacted_)?think(?:ing)?>([\s\S]*)$/i)
  if (openMatch) {
    return {
      reasoning: openMatch[1].trim(),
      content: '',
    }
  }
  return {
    reasoning: '',
    content: text.trim(),
  }
}

const TABLE_SEP_LINE_RE = /^\s*\|?(?:\s*[:\-—–−]+\s*\|)+\s*[:\-—–−]*\s*\|?\s*$/

function normalizeTableSeparatorLine (line) {
  if (!TABLE_SEP_LINE_RE.test(line)) return line
  return line.replace(/[—–−]/g, '-').replace(/:?-+:?/g, (cell) => {
    const left = cell.startsWith(':')
    const right = cell.endsWith(':')
    const dashes = '-'.repeat(Math.max(3, (cell.match(/-/g) || []).length))
    return `${left ? ':' : ''}${dashes}${right ? ':' : ''}`
  })
}

/**
 * 修复模型常见的「挤在一行」的 Markdown 表格，便于 vue-markdown 正确渲染。
 * 例：| a | b ||---|---|| 1 | 2 |  → 分行；分隔行 — 归一为 -
 */
export function normalizeMarkdownTables (text) {
  if (!text || typeof text !== 'string') return text || ''

  // 挤在一行的表格：行与行之间常被写成 ||（正常空单元格是 "| |"，中间有空格）
  let out = /\|\|/.test(text) ? text.replace(/\|\|/g, '|\n|') : text

  out = out
    .split('\n')
    .map(normalizeTableSeparatorLine)
    .join('\n')

  // 表格块与前后正文之间补空行，避免被吃进段落
  out = out.replace(/([^\n|])\n(\|[^\n]*\|)\n(\s*\|?(?:\s*:?-+:?\s*\|)+)/g, '$1\n\n$2\n$3')
  out = out.replace(/(\n\|[^\n]*\|)\n(?!\||\s*$|\n)/g, '$1\n\n')

  return out
}

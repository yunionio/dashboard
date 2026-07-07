/**
 * Parse Anthropic Messages API streaming / non-streaming text for dashboard chat test.
 */

export function extractAnthropicStreamDelta (payload) {
  if (!payload || payload === '[DONE]') return ''
  let data
  try {
    data = JSON.parse(payload)
  } catch (e) {
    return ''
  }
  if (data?.type === 'content_block_delta' && data?.delta?.type === 'text_delta') {
    return data.delta.text || ''
  }
  return ''
}

export function extractAnthropicResponseText (data) {
  if (!data) return ''
  if (typeof data === 'string') {
    try {
      return extractAnthropicResponseText(JSON.parse(data))
    } catch (e) {
      return data
    }
  }
  const blocks = data.content
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter(block => block?.type === 'text' && block.text)
    .map(block => block.text)
    .join('')
}

export function appendAnthropicStreamLine (line, state = {}) {
  const trimmed = String(line || '').trim()
  if (!trimmed) return { delta: '', state }

  const eventType = state.pendingEvent || ''
  if (trimmed.startsWith('event:')) {
    return {
      delta: '',
      state: { ...state, pendingEvent: trimmed.slice(6).trim() },
    }
  }
  if (!trimmed.startsWith('data:')) {
    return { delta: '', state }
  }

  const payload = trimmed.slice(5).trim()
  const nextState = { ...state, pendingEvent: '' }

  if (eventType === 'content_block_delta' || !eventType) {
    const delta = extractAnthropicStreamDelta(payload)
    return { delta, state: nextState }
  }
  return { delta: '', state: nextState }
}

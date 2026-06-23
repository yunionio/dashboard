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

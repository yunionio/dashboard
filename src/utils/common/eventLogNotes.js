const JSON_MODE = 'application/json'
const PLAIN_MODE = 'text/plain'

function tryParseJson (raw) {
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

/** 从 notes 中取首个 { 或 [ 起，向后截断尝试 JSON.parse */
function parseEmbeddedJson (raw) {
  for (const opener of ['{', '[']) {
    const start = raw.indexOf(opener)
    if (start < 0) continue
    const slice = raw.slice(start).trim()
    for (let end = slice.length; end > 1; end--) {
      try {
        return {
          prefix: raw.slice(0, start).trim(),
          value: JSON.parse(slice.slice(0, end)),
        }
      } catch (e) {
        // continue
      }
    }
  }
  return null
}

/** 解析 action 日志中常见的 a=>b: detail 结构 */
function parseArrowDetail (raw) {
  const matched = raw.match(/^([^=]+)=>([^:]+):\s*([\s\S]+)$/)
  if (!matched) return null
  const detail = matched[3].trim()
  const embedded = parseEmbeddedJson(detail)
  if (embedded) {
    return {
      from: matched[1].trim(),
      to: matched[2].trim(),
      ...((typeof embedded.value === 'object' && embedded.value !== null && !Array.isArray(embedded.value))
        ? embedded.value
        : { detail: embedded.value }),
    }
  }
  return {
    from: matched[1].trim(),
    to: matched[2].trim(),
    detail,
  }
}

/**
 * 将操作日志 notes 格式化为可读的展示文本，并返回 CodeMirror mode。
 * @param {string} notes
 * @returns {{ text: string, mode: string }}
 */
export function formatEventLogNotes (notes) {
  if (notes == null || notes === '') {
    return { text: '{\n}', mode: JSON_MODE }
  }
  const raw = String(notes).trim()
  if (!raw) {
    return { text: '{\n}', mode: JSON_MODE }
  }

  let parsed = tryParseJson(raw)
  if (parsed != null) {
    if (typeof parsed === 'string') {
      const inner = tryParseJson(parsed)
      if (inner != null) {
        parsed = inner
      }
    }
    return { text: JSON.stringify(parsed, null, 2), mode: JSON_MODE }
  }

  const embedded = parseEmbeddedJson(raw)
  if (embedded) {
    let display
    if (embedded.prefix) {
      const prefix = embedded.prefix.replace(/:\s*$/, '').trim()
      display = {
        message: prefix,
        ...((typeof embedded.value === 'object' && embedded.value !== null && !Array.isArray(embedded.value))
          ? embedded.value
          : { data: embedded.value }),
      }
    } else {
      display = embedded.value
    }
    return { text: JSON.stringify(display, null, 2), mode: JSON_MODE }
  }

  const arrowObj = parseArrowDetail(raw)
  if (arrowObj) {
    return { text: JSON.stringify(arrowObj, null, 2), mode: JSON_MODE }
  }

  return { text: raw, mode: PLAIN_MODE }
}

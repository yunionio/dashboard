import { Manager } from '@/utils/manager'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'

export function normalizeBaseUrl (url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  return raw.replace(/\/+$/, '')
}

export function buildOpenAIBaseUrl (baseUrl) {
  const base = normalizeBaseUrl(baseUrl)
  if (!base) return ''
  if (/\/ai\/openai\/v1$/i.test(base)) {
    return base
  }
  if (/\/openai\/v1$/i.test(base)) {
    return base.replace(/\/openai\/v1$/i, '/ai/openai/v1')
  }
  return `${base}/ai/openai/v1`
}

export function buildChatCompletionsUrl (baseUrl) {
  const openaiBase = buildOpenAIBaseUrl(baseUrl)
  if (!openaiBase) return ''
  return `${openaiBase}/chat/completions`
}

export function buildAnthropicBaseUrl (baseUrl) {
  const base = normalizeBaseUrl(baseUrl)
  if (!base) return ''
  if (/\/ai\/anthropic$/i.test(base)) {
    return base
  }
  if (/\/anthropic$/i.test(base)) {
    return base.replace(/\/anthropic$/i, '/ai/anthropic')
  }
  return `${base}/ai/anthropic`
}

export function buildAnthropicMessagesUrl (baseUrl) {
  const anthropicBase = buildAnthropicBaseUrl(baseUrl)
  if (!anthropicBase) return ''
  return `${anthropicBase}/v1/messages`
}

export function buildClaudeCodeEnvExample ({
  anthropicBaseUrl,
  virtualKey = '<API Key>',
  model = 'your-model',
  opusModel,
  sonnetModel,
  haikuModel,
  subagentModel,
} = {}) {
  const base = anthropicBaseUrl
    ? `${normalizeBaseUrl(anthropicBaseUrl)}/`
    : '<endpoint>/ai/anthropic/'
  const key = virtualKey || '<API Key>'
  const m = model || 'your-model'
  const opus = opusModel || m
  const sonnet = sonnetModel || m
  const haiku = haikuModel || m
  const subagent = subagentModel || haiku || m
  return [
    `export ANTHROPIC_BASE_URL=${base}`,
    `export ANTHROPIC_AUTH_TOKEN=${key}`,
    `export ANTHROPIC_MODEL=${m}`,
    `export ANTHROPIC_DEFAULT_OPUS_MODEL=${opus}`,
    `export ANTHROPIC_DEFAULT_SONNET_MODEL=${sonnet}`,
    `export ANTHROPIC_DEFAULT_HAIKU_MODEL=${haiku}`,
    `export CLAUDE_CODE_SUBAGENT_MODEL=${subagent}`,
    'export ENABLE_TOOL_SEARCH=false',
  ].join('\n')
}

function pushShellComment (lines, comment) {
  const text = String(comment || '').trim()
  if (text) {
    lines.push(`# ${text}`)
  }
}

export function buildCodexClimcExample ({
  virtualKeyRef = '<virtual-key>',
  model = 'your-model',
  routingRef = '',
  comments = {},
} = {}) {
  const vk = String(virtualKeyRef || '').trim() || '<virtual-key>'
  const m = String(model || '').trim() || 'your-model'
  const routing = String(routingRef || '').trim()
  const lines = []
  pushShellComment(lines, comments.homeDir)
  lines.push('CODEX_HOME_DIR="${' + 'CODEX_HOME_DIR:-$HOME/.codex-aiproxy}"')
  lines.push('')
  pushShellComment(lines, comments.mkdir)
  lines.push('mkdir -p "$CODEX_HOME_DIR"')
  lines.push('')
  pushShellComment(lines, comments.climc)
  lines.push('climc ai-codex-config \\')
  lines.push(`  --virtual-key ${vk} \\`)
  lines.push(`  --model ${m} \\`)
  if (routing) {
    lines.push(`  --routing ${routing} \\`)
  }
  lines.push('  --codex-home "$CODEX_HOME_DIR"')
  lines.push('')
  pushShellComment(lines, comments.launch)
  lines.push('source "$CODEX_HOME_DIR/aiproxy.env" && CODEX_HOME="$CODEX_HOME_DIR" codex --cd "$PWD"')
  return lines.join('\n')
}

export function parseShellScriptLines (script) {
  return String(script || '').split('\n').map(text => ({
    type: /^\s*#/.test(text) ? 'comment' : 'code',
    text,
  }))
}

export const DEFAULT_ANTHROPIC_MAX_TOKENS = 4096

export function buildAnthropicCurlExample ({
  endpoint,
  model,
  virtualKey = '<API Key>',
  maxTokens = DEFAULT_ANTHROPIC_MAX_TOKENS,
} = {}) {
  const url = endpoint || '<endpoint>/ai/anthropic/v1/messages'
  const m = model || 'your-model'
  const key = virtualKey || '<API Key>'
  const body = JSON.stringify({
    model: m,
    max_tokens: maxTokens,
    stream: true,
    messages: [{ role: 'user', content: 'hello' }],
  })
  return [
    `curl -X POST '${url}' \\`,
    `  -H 'Authorization: Bearer ${key}' \\`,
    '  -H \'Content-Type: application/json\' \\',
    `  -d '${body}'`,
  ].join('\n')
}

export function buildAnthropicChatTestRequestConfig ({
  endpoint,
  model,
  virtualKey,
  maxTokens = DEFAULT_ANTHROPIC_MAX_TOKENS,
} = {}) {
  const url = String(endpoint || '').trim()
  const m = String(model || '').trim()
  const key = String(virtualKey || '').trim()
  if (!url || !m || !key) return null
  return {
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: m,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: 'hello' }],
    },
    model: m,
    protocol: 'anthropic',
  }
}

export function isPlaceholderApiKey (authHeader) {
  const value = String(authHeader || '').trim()
  if (!value) return true
  const token = value.replace(/^Bearer\s+/i, '').trim()
  if (!token) return true
  return /<\s*api\s*key\s*>/i.test(token) || /<\s*api\s*key\s*>/i.test(value)
}

export function buildAiproxyCurlExample ({ endpoint, model, virtualKey = '<API Key>' } = {}) {
  const url = endpoint || '<endpoint>/ai/openai/v1/chat/completions'
  const m = model || 'your-model'
  const key = virtualKey || '<API Key>'
  return [
    `curl -X POST '${url}' \\`,
    `  -H 'Authorization: Bearer ${key}' \\`,
    '  -H \'Content-Type: application/json\' \\',
    `  -d '{"model":"${m}","messages":[{"role":"user","content":"hello"}]}'`,
  ].join('\n')
}

export function buildChatTestRequestConfig ({ endpoint, model, virtualKey } = {}) {
  const url = String(endpoint || '').trim()
  const m = String(model || '').trim()
  const key = String(virtualKey || '').trim()
  if (!url || !m || !key) return null
  return {
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: m,
      messages: [{ role: 'user', content: 'hello' }],
    },
    model: m,
    protocol: 'openai',
  }
}

async function fetchServiceApiServer (vm) {
  const fromStore = normalizeBaseUrl(vm?.$store?.getters?.globalConfig?.api_server)
  if (fromStore) return fromStore
  try {
    const manager = new Manager('service_settings', 'v1')
    const { data } = await manager.list()
    return normalizeBaseUrl(data?.common?.api_server)
  } catch (e) {
    return ''
  }
}

async function fetchProxyNodeAccessAddressOnly (vm, nodeId) {
  if (!nodeId) return ''
  try {
    const manager = new Manager('ai_proxy_nodes')
    const { data } = await manager.get({
      id: nodeId,
      params: { scope: getAiproxyResourceScope('ai_proxy_nodes', vm) },
    })
    return normalizeBaseUrl(data?.access_address)
  } catch (e) {
    return ''
  }
}

async function fetchNodeAddress (vm, nodeId) {
  if (!nodeId) return ''
  try {
    const manager = new Manager('ai_proxy_nodes')
    const { data } = await manager.get({
      id: nodeId,
      params: { scope: getAiproxyResourceScope('ai_proxy_nodes', vm) },
    })
    return normalizeBaseUrl(data?.address)
  } catch (e) {
    return ''
  }
}

async function fetchRoutingProxyNodeId (vm, routingId) {
  if (!routingId) return ''
  try {
    const manager = new Manager('ai_routings')
    const { data } = await manager.get({
      id: routingId,
      params: {
        scope: getAiproxyResourceScope('ai_routings', vm),
        details: true,
      },
    })
    return String(data?.ai_proxy_node_id || '').trim()
  } catch (e) {
    return ''
  }
}

async function fetchPublicAiproxyEndpoint (vm) {
  try {
    const manager = new Manager('endpoints', 'v1')
    const { data: { data = [] } } = await manager.list({
      params: {
        service: 'aiproxy',
        interface: 'public',
        limit: 20,
      },
    })
    const urls = (data || [])
      .map(item => normalizeBaseUrl(item.url))
      .filter(Boolean)
    const https = urls.find(u => u.startsWith('https://'))
    return https || urls[0] || ''
  } catch (e) {
    return ''
  }
}

async function fetchPrimaryProxyNodeAccessAddressOnly (vm) {
  try {
    const manager = new Manager('ai_proxy_nodes')
    const { data: { data = [] } } = await manager.list({
      params: {
        scope: getAiproxyResourceScope('ai_proxy_nodes', vm),
        limit: 20,
      },
    })
    const rows = data || []
    const primary = rows.find(item => item.id === 'primary' || item.name === 'primary')
    const picked = primary || rows.find(item => item.enabled && item.is_active) || rows[0]
    return normalizeBaseUrl(picked?.access_address)
  } catch (e) {
    return ''
  }
}

async function fetchPrimaryProxyNodeAddress (vm) {
  try {
    const manager = new Manager('ai_proxy_nodes')
    const { data: { data = [] } } = await manager.list({
      params: {
        scope: getAiproxyResourceScope('ai_proxy_nodes', vm),
        limit: 20,
      },
    })
    const rows = data || []
    const primary = rows.find(item => item.id === 'primary' || item.name === 'primary')
    const picked = primary || rows.find(item => item.enabled && item.is_active) || rows[0]
    return normalizeBaseUrl(picked?.address)
  } catch (e) {
    return ''
  }
}

async function resolveAiproxyBaseUrlLegacy (vm, { routingId, nodeId } = {}) {
  const fromServiceSettings = await fetchServiceApiServer(vm)
  if (fromServiceSettings) return fromServiceSettings

  const rid = String(routingId || '').trim()
  let boundNodeId = String(nodeId || '').trim()
  if (rid && !boundNodeId) {
    boundNodeId = await fetchRoutingProxyNodeId(vm, rid)
  }
  const fromNode = await fetchNodeAddress(vm, boundNodeId)
  if (fromNode) return fromNode

  const fromEndpoint = await fetchPublicAiproxyEndpoint(vm)
  if (fromEndpoint) return fromEndpoint

  return fetchPrimaryProxyNodeAddress(vm)
}

/** Prefer routing-bound proxy node access_address; fall back to legacy resolution. */
export async function resolveAiproxyBaseUrl (vm, { routingId } = {}) {
  const rid = String(routingId || '').trim()
  let nodeId = ''
  if (rid) {
    nodeId = await fetchRoutingProxyNodeId(vm, rid)
    if (nodeId) {
      const fromAccess = await fetchProxyNodeAccessAddressOnly(vm, nodeId)
      if (fromAccess) return fromAccess
    }
  } else {
    const fromPrimaryAccess = await fetchPrimaryProxyNodeAccessAddressOnly(vm)
    if (fromPrimaryAccess) return fromPrimaryAccess
  }
  return resolveAiproxyBaseUrlLegacy(vm, { routingId: rid, nodeId })
}

export async function resolveAiproxyChatCompletionsUrl (vm, { routingId } = {}) {
  const base = await resolveAiproxyBaseUrl(vm, { routingId })
  return buildChatCompletionsUrl(base)
}

export async function resolveAiproxyOpenAIBaseUrl (vm, { routingId } = {}) {
  const base = await resolveAiproxyBaseUrl(vm, { routingId })
  return buildOpenAIBaseUrl(base)
}

export async function resolveAiproxyAnthropicBaseUrl (vm, { routingId } = {}) {
  const base = await resolveAiproxyBaseUrl(vm, { routingId })
  return buildAnthropicBaseUrl(base)
}

export async function resolveAiproxyAnthropicMessagesUrl (vm, { routingId } = {}) {
  const base = await resolveAiproxyBaseUrl(vm, { routingId })
  return buildAnthropicMessagesUrl(base)
}

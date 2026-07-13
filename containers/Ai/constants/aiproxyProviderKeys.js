// Known built-in provider_key values (mirrors onecloud/pkg/apis/aiproxy/provider_keys.go)
export const AIPROXY_PROVIDER_KEYS = [
  'anthropic',
  // 'azure', // uncommon
  // 'bedrock', // uncommon
  // 'cerebras', // uncommon
  // 'cohere', // uncommon
  'deepseek',
  'gemini',
  'groq',
  'mistral',
  'ollama',
  'openai',
  // 'parasail', // uncommon
  // 'perplexity', // uncommon
  'sglang',
  // 'vertex', // uncommon
  'openrouter',
  // 'elevenlabs', // uncommon
  'huggingface',
  // 'nebius', // uncommon
  // 'xai', // uncommon
  // 'replicate', // uncommon
  'vllm',
  // 'runway', // uncommon
  // 'fireworks', // uncommon
  // 'aliyun', // uncommon
  // 'baidu', // uncommon
  'xiaomi',
  'moonshot',
  'zhipu',
]

const ZHIPU_ANTHROPIC_BASE_URL = 'https://open.bigmodel.cn/api/anthropic'

export function getAiproxyProviderKeyDisplayName (vm, providerKey) {
  const key = String(providerKey || '').trim()
  if (!key) return ''
  const i18nKey = `aice.aiproxy.provider_key.${key}`
  if (vm && vm.$te && vm.$te(i18nKey)) return vm.$t(i18nKey)
  return key
}

export function getAiproxyProviderKeyOptions (vm) {
  return AIPROXY_PROVIDER_KEYS.map(key => ({
    id: key,
    name: getAiproxyProviderKeyDisplayName(vm, key),
  }))
}

export function filterAiproxyProviderKeys (query, vm) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return [...AIPROXY_PROVIDER_KEYS]
  return AIPROXY_PROVIDER_KEYS.filter(key => {
    const id = key.toLowerCase()
    if (id.includes(q)) return true
    const display = vm ? String(getAiproxyProviderKeyDisplayName(vm, key)).toLowerCase() : ''
    if (display && display.includes(q)) return true
    if ((q.includes('moonshot') || q.includes('kimi')) && id === 'moonshot') return true
    if ((q.includes('zhipu') || q.includes('智谱') || q.includes('glm') || q.includes('z.ai') || q.includes('zai')) && id === 'zhipu') return true
    return false
  })
}

export { ZHIPU_ANTHROPIC_BASE_URL }

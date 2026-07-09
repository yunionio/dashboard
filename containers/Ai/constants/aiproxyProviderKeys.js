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
]

export function getAiproxyProviderKeyOptions (vm) {
  return AIPROXY_PROVIDER_KEYS.map(key => ({ id: key, name: key }))
}

export function filterAiproxyProviderKeys (query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return [...AIPROXY_PROVIDER_KEYS]
  return AIPROXY_PROVIDER_KEYS.filter(key => {
    const id = key.toLowerCase()
    if (id.includes(q)) return true
    if ((q.includes('moonshot') || q.includes('kimi')) && id === 'moonshot') return true
    return false
  })
}

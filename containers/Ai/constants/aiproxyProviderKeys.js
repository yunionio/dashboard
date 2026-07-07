// Built-in provider_key values from aiproxy catalog seed (onecloud/pkg/aiproxy/models/catalog_seed.go)
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
]

export function getAiproxyProviderKeyOptions (vm) {
  return AIPROXY_PROVIDER_KEYS.map(key => ({ id: key, name: key }))
}

export function filterAiproxyProviderKeys (query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return [...AIPROXY_PROVIDER_KEYS]
  return AIPROXY_PROVIDER_KEYS.filter(key => key.toLowerCase().includes(q))
}

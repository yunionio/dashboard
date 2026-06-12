// Built-in provider_key values from aiproxy catalog seed (onecloud/pkg/aiproxy/models/catalog_seed.go)
export const AIPROXY_PROVIDER_KEYS = [
  'anthropic',
  'azure',
  'bedrock',
  'cerebras',
  'cohere',
  'gemini',
  'groq',
  'mistral',
  'ollama',
  'openai',
  'parasail',
  'perplexity',
  'sgl',
  'vertex',
  'openrouter',
  'elevenlabs',
  'huggingface',
  'nebius',
  'xai',
  'replicate',
  'vllm',
  'runway',
  'fireworks',
  'aliyun',
  'baidu',
  'xiaomi',
]

export function getAiproxyProviderKeyOptions (vm) {
  return AIPROXY_PROVIDER_KEYS.map(key => ({ id: key, name: key }))
}

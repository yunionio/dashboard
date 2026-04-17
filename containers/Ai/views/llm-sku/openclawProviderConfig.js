/**
 * OpenClaw 模型供应商（AI Providers）环境变量配置
 * 用于：1）生成「填写并创建新密钥」表单 2）选择已有密钥时展示「将配置的 AI 供应商」
 */

/** @typedef {{ sectionKey: string, sectionLabelKey: string, required: boolean, vars: Array<{ envKey: string, providerLabelKey: string, descriptionKey: string, overrideUrlKey?: string, component?: 'a-select', resource?: string, placeholderKey?: string, required?: boolean, modelProviderType?: string }> }} OpenclawSection */

export const OPENCLAW_PROVIDER_SECTIONS = [
  {
    sectionKey: 'ai_providers',
    sectionLabelKey: 'aice.openclaw.section.ai_providers_env',
    required: true,
    vars: [
      { envKey: 'ANTHROPIC_API_KEY', providerLabelKey: 'aice.openclaw.provider.anthropic', descriptionKey: 'aice.openclaw.env.ANTHROPIC_API_KEY', overrideUrlKey: 'ANTHROPIC_BASE_URL' },
      // { envKey: 'OPENAI_API_KEY', providerLabelKey: 'aice.openclaw.provider.openai', descriptionKey: 'aice.openclaw.env.OPENAI_API_KEY' },
      // { envKey: 'OPENROUTER_API_KEY', providerLabelKey: 'aice.openclaw.provider.openrouter', descriptionKey: 'aice.openclaw.env.OPENROUTER_API_KEY' },
      // { envKey: 'GEMINI_API_KEY', providerLabelKey: 'aice.openclaw.provider.gemini', descriptionKey: 'aice.openclaw.env.GEMINI_API_KEY' },
      // { envKey: 'XAI_API_KEY', providerLabelKey: 'aice.openclaw.provider.xai', descriptionKey: 'aice.openclaw.env.XAI_API_KEY' },
      // { envKey: 'GROQ_API_KEY', providerLabelKey: 'aice.openclaw.provider.groq', descriptionKey: 'aice.openclaw.env.GROQ_API_KEY' },
      // { envKey: 'MISTRAL_API_KEY', providerLabelKey: 'aice.openclaw.provider.mistral', descriptionKey: 'aice.openclaw.env.MISTRAL_API_KEY' },
      // { envKey: 'CEREBRAS_API_KEY', providerLabelKey: 'aice.openclaw.provider.cerebras', descriptionKey: 'aice.openclaw.env.CEREBRAS_API_KEY' },
      // { envKey: 'VENICE_API_KEY', providerLabelKey: 'aice.openclaw.provider.venice', descriptionKey: 'aice.openclaw.env.VENICE_API_KEY' },
      { envKey: 'MOONSHOT_API_KEY', providerLabelKey: 'aice.openclaw.provider.moonshot', descriptionKey: 'aice.openclaw.env.MOONSHOT_API_KEY', overrideUrlKey: 'MOONSHOT_BASE_URL' },
      // { envKey: 'KIMI_API_KEY', providerLabelKey: 'aice.openclaw.provider.kimi', descriptionKey: 'aice.openclaw.env.KIMI_API_KEY', overrideUrlKey: 'KIMI_BASE_URL' },
      { envKey: 'MINIMAX_API_KEY', providerLabelKey: 'aice.openclaw.provider.minimax', descriptionKey: 'aice.openclaw.env.MINIMAX_API_KEY' },
      { envKey: 'ZAI_API_KEY', providerLabelKey: 'aice.openclaw.provider.zai', descriptionKey: 'aice.openclaw.env.ZAI_API_KEY' },
      // { envKey: 'AI_GATEWAY_API_KEY', providerLabelKey: 'aice.openclaw.provider.ai_gateway', descriptionKey: 'aice.openclaw.env.AI_GATEWAY_API_KEY', overrideUrlKey: 'AI_GATEWAY_BASE_URL' },
      // { envKey: 'OPENCODE_API_KEY', providerLabelKey: 'aice.openclaw.provider.opencode', descriptionKey: 'aice.openclaw.env.OPENCODE_API_KEY' },
      // { envKey: 'SYNTHETIC_API_KEY', providerLabelKey: 'aice.openclaw.provider.synthetic', descriptionKey: 'aice.openclaw.env.SYNTHETIC_API_KEY' },
      // { envKey: 'COPILOT_GITHUB_TOKEN', providerLabelKey: 'aice.openclaw.provider.copilot', descriptionKey: 'aice.openclaw.env.COPILOT_GITHUB_TOKEN' },
      // { envKey: 'XIAOMI_API_KEY', providerLabelKey: 'aice.openclaw.provider.xiaomi', descriptionKey: 'aice.openclaw.env.XIAOMI_API_KEY' },
    ],
  },
  // {
  //   sectionKey: 'deepgram',
  //   sectionLabelKey: 'aice.openclaw.section.deepgram',
  //   required: false,
  //   vars: [
  //     { envKey: 'DEEPGRAM_API_KEY', providerLabelKey: 'aice.openclaw.provider.deepgram', descriptionKey: 'aice.openclaw.env.DEEPGRAM_API_KEY' },
  //   ],
  // },
  // {
  //   sectionKey: 'bedrock',
  //   sectionLabelKey: 'aice.openclaw.section.bedrock',
  //   required: false,
  //   vars: [
  //     { envKey: 'AWS_ACCESS_KEY_ID', providerLabelKey: 'aice.openclaw.provider.bedrock', descriptionKey: 'aice.openclaw.env.AWS_ACCESS_KEY_ID' },
  //     { envKey: 'AWS_SECRET_ACCESS_KEY', providerLabelKey: 'aice.openclaw.provider.bedrock', descriptionKey: 'aice.openclaw.env.AWS_SECRET_ACCESS_KEY' },
  //     { envKey: 'AWS_REGION', providerLabelKey: 'aice.openclaw.provider.bedrock', descriptionKey: 'aice.openclaw.env.AWS_REGION' },
  //     { envKey: 'AWS_SESSION_TOKEN', providerLabelKey: 'aice.openclaw.provider.bedrock', descriptionKey: 'aice.openclaw.env.AWS_SESSION_TOKEN' },
  //     { envKey: 'BEDROCK_PROVIDER_FILTER', providerLabelKey: 'aice.openclaw.provider.bedrock', descriptionKey: 'aice.openclaw.env.BEDROCK_PROVIDER_FILTER' },
  //   ],
  // },
  {
    sectionKey: 'ollama',
    sectionLabelKey: 'aice.openclaw.section.ollama',
    required: false,
    vars: [
      { envKey: 'OLLAMA_BASE_URL', providerLabelKey: 'aice.openclaw.provider.ollama', descriptionKey: 'aice.openclaw.env.OLLAMA_BASE_URL' },
      {
        envKey: 'OPENCLAW_PRIMARY_MODEL',
        providerLabelKey: 'aice.openclaw.provider.ollama',
        descriptionKey: 'aice.openclaw.env.OPENCLAW_PRIMARY_MODEL',
        component: 'a-select',
        resource: 'llms/provider-models',
        placeholderKey: 'aice.model',
        required: true,
        modelProviderType: 'ollama',
      },
    ],
  },
  {
    sectionKey: 'vllm',
    sectionLabelKey: 'aice.openclaw.section.vllm',
    required: false,
    vars: [
      { envKey: 'VLLM_BASE_URL', providerLabelKey: 'aice.openclaw.provider.vllm', descriptionKey: 'aice.openclaw.env.VLLM_BASE_URL', required: true },
      { envKey: 'VLLM_API_KEY', providerLabelKey: 'aice.openclaw.provider.vllm', descriptionKey: 'aice.openclaw.env.VLLM_API_KEY', required: false },
      {
        envKey: 'OPENCLAW_PRIMARY_MODEL',
        providerLabelKey: 'aice.openclaw.provider.vllm',
        descriptionKey: 'aice.openclaw.env.OPENCLAW_PRIMARY_MODEL_VLLM',
        component: 'a-select',
        resource: 'llms/provider-models',
        placeholderKey: 'aice.model',
        required: true,
        modelProviderType: 'vllm',
      },
    ],
  },
]

/** 去重后的供应商列表（用于下拉多选），按在 OPENCLAW_PROVIDER_SECTIONS 中首次出现顺序 */
const _providerKeySet = new Set()
export const OPENCLAW_PROVIDER_OPTIONS = []
OPENCLAW_PROVIDER_SECTIONS.forEach(section => {
  section.vars.forEach(({ providerLabelKey }) => {
    if (!_providerKeySet.has(providerLabelKey)) {
      _providerKeySet.add(providerLabelKey)
      OPENCLAW_PROVIDER_OPTIONS.push(providerLabelKey)
    }
  })
})

/**
 * KEY -> provider 显示名 i18n key（用于选择已有密钥时展示「将配置的 AI 供应商」）
 * @type {Record<string, string>}
 */
export const OPENCLAW_ENV_KEY_TO_PROVIDER_LABEL = {}
OPENCLAW_PROVIDER_SECTIONS.forEach(section => {
  section.vars.forEach(({ envKey, providerLabelKey }) => {
    OPENCLAW_ENV_KEY_TO_PROVIDER_LABEL[envKey] = providerLabelKey
  })
})

/**
 * 根据已选 export keys 得到对应的 provider 显示名 i18n keys（去重）
 * @param {string[]} exportKeys
 * @returns {string[]}
 */
export function getProviderLabelKeysFromExportKeys (exportKeys) {
  if (!Array.isArray(exportKeys) || exportKeys.length === 0) return []
  const set = new Set()
  exportKeys.forEach(key => {
    const labelKey = OPENCLAW_ENV_KEY_TO_PROVIDER_LABEL[key]
    if (labelKey) set.add(labelKey)
  })
  return Array.from(set)
}

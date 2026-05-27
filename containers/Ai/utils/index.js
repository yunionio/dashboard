/**
 * 模型品牌图标：来自 lobe-icons (MIT) 与 simple-icons (CC0)，见 src/assets/images/llm-images/
 * @see https://github.com/lobehub/lobe-icons
 */

/**
 * 解析 webpack 静态资源 require 结果（file-loader 可能为 string 或 { default: string }）
 */
function resolveAssetUrl (asset) {
  if (!asset) return ''
  if (typeof asset === 'string') return asset
  return asset.default || ''
}

// 须放在 assets/images 等目录：Icon 目录下 SVG 走 svg-sprite-loader，不能用于 <img src>
const MODEL_ICON_RULES = [
  { test: /qwen|qianwen/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/qianwen.svg')) },
  { test: /deepseek/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/deepseek.svg')) },
  { test: /glm|chatglm/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/glm.svg')) },
  { test: /falcon/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/falcon.svg')) },
  { test: /gpt-oss|gpt/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/gpt.svg')) },
  { test: /whisper/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/whisper.svg')) },
  { test: /voxtral/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/voxtral.svg')) },
  { test: /mistral/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/mistral.svg')) },
  { test: /granite/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/granite.svg')) },
  { test: /\bbge\b|bge-/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/bge.svg')) },
  { test: /jina/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/jina.svg')) },
  { test: /kimi|moonshot/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/kimi.svg')) },
  { test: /tencent\/hy|tencent\/hunyuan|hunyuan|混元/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/hy.svg')) },
  { test: /minimax/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/minimax.svg')) },
  { test: /\bstep/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/step.svg')) },
  { test: /paddle|ocr-vl/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/paddle.svg')) },
  { test: /openclaw|open-claw/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/openclaw.svg')) },
  { test: /dify/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/dify.svg')) },
  { test: /comfyui|comfy-ui/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/comfyui.svg')) },
  { test: /hermes/i, icon: resolveAssetUrl(require('@/assets/images/llm-images/hermes-agent.svg')) },
]

/**
 * 根据模型名称返回展示用图标 URL（img src）；无匹配时返回空字符串
 * @param {string} modelName
 * @returns {string}
 */
export function getModelIcon (modelName) {
  const name = String(modelName || '')
  const rule = MODEL_ICON_RULES.find(r => r.test.test(name))
  return rule ? rule.icon : ''
}

/**
 * 无品牌图标时，用模型名称生成卡片占位文案（首字母）
 * @param {string} modelName
 * @returns {string}
 */
export function getModelIconLabel (modelName) {
  const name = String(modelName || '').trim()
  if (!name) return '?'
  return name.slice(0, 2).toUpperCase()
}

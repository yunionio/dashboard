const INFERENCE_LLM_TYPES = ['vllm', 'ollama', 'sglang']

/**
 * Resolve display text for the model used by an llm_sku row (inference templates).
 * @param {object} item
 * @returns {string}
 */
export function getSkuModelDisplayText (item) {
  if (!item) return ''

  const mounted = item.mounted_model_details || []
  if (mounted.length) {
    return mounted.map(v => v.fullname).filter(Boolean).join(', ')
  }

  const llmType = item.llm_type
  const spec = item.llm_spec
  if (spec && typeof spec === 'object' && !Array.isArray(spec)) {
    if (llmType && spec[llmType] && spec[llmType].preferred_model) {
      return String(spec[llmType].preferred_model)
    }
    for (let i = 0; i < INFERENCE_LLM_TYPES.length; i++) {
      const key = INFERENCE_LLM_TYPES[i]
      const block = spec[key]
      if (block && block.preferred_model) {
        return String(block.preferred_model)
      }
    }
  }

  if (item.preferred_model) {
    return String(item.preferred_model)
  }
  if (item.huggingface_repo_id) {
    return String(item.huggingface_repo_id)
  }
  if (item.model_scope_model_id) {
    return String(item.model_scope_model_id)
  }
  if (item.llm_model_name) {
    return String(item.llm_model_name)
  }

  return ''
}

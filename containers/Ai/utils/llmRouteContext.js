const INFERENCE_LLM_TYPES = ['vllm', 'ollama', 'sglang']
const APP_LLM_TYPES = ['dify', 'openclaw', 'comfyui', 'hermes-agent']
const DESKTOP_LLM_TYPES = ['desktop']

/**
 * Derive list/create paths and llm_type filters from the current route path.
 * @param {string} path
 */
export function parseLlmImageRoute (path = '') {
  const isDesktopImageRoute = path.includes('/app-desktop-image')
  const isAgentImageRoute = path.includes('/agent-llm-image') || path.includes('/app-llm-image')
  const isInferenceImageRoute = path.includes('/llm-image') && !isDesktopImageRoute && !isAgentImageRoute
  return {
    isDesktopImageRoute,
    isAgentImageRoute,
    isInferenceImageRoute,
    imageListPath: isDesktopImageRoute ? '/app-desktop-image' : (isAgentImageRoute ? '/agent-llm-image' : '/llm-image'),
  }
}

export function getLlmImageTypeFilter (path = '') {
  const { isDesktopImageRoute, isAgentImageRoute } = parseLlmImageRoute(path)
  if (isDesktopImageRoute) {
    return 'llm_type.in(desktop)'
  }
  if (isAgentImageRoute) {
    return 'llm_type.notin(vllm,ollama,sglang,desktop)'
  }
  return 'llm_type.in(vllm,ollama,sglang)'
}

export function getAllowedImageLlmTypes (path = '') {
  if (path.includes('/app-llm-sku/import-from-community')) {
    return [...APP_LLM_TYPES]
  }
  if (path.includes('/app-desktop-sku/import-from-community')) {
    return [...DESKTOP_LLM_TYPES]
  }
  const { isDesktopImageRoute, isAgentImageRoute } = parseLlmImageRoute(path)
  if (isDesktopImageRoute) {
    return [...DESKTOP_LLM_TYPES]
  }
  if (isAgentImageRoute) {
    return [...APP_LLM_TYPES]
  }
  return [...INFERENCE_LLM_TYPES]
}

export function isLlmImageMenuPath (path = '') {
  const imageCtx = parseLlmImageRoute(path)
  return imageCtx.isDesktopImageRoute || imageCtx.isAgentImageRoute || imageCtx.isInferenceImageRoute
}

export function parseLlmRoute (path = '') {
  const isImageMenuPath = isLlmImageMenuPath(path)
  const isDesktopType = !isImageMenuPath && (
    path.includes('/app-desktop-sku') ||
    (path.includes('/app-desktop') && !path.includes('/app-desktop-image'))
  )
  const isApplyType = !isImageMenuPath && path.includes('/app-llm') && !isDesktopType
  const isInferenceType = !isApplyType && !isDesktopType && !isImageMenuPath

  let llmTypes = INFERENCE_LLM_TYPES
  if (isDesktopType) {
    llmTypes = DESKTOP_LLM_TYPES
  } else if (isApplyType) {
    llmTypes = APP_LLM_TYPES
  }

  let instanceListPath = '/llm'
  let instanceCreatePath = '/llm/create'
  const deploymentListPath = '/llm-deployment'
  const deploymentCreatePath = '/llm-deployment/create'
  let skuListPath = '/llm-sku'
  let skuCreatePath = '/llm-sku/create'
  let skuImportFromCommunityPath = ''
  let skuImportFromModelSetsPath = ''
  let skuImportFromHuggingfacePath = ''
  if (isApplyType) {
    instanceListPath = '/app-llm'
    instanceCreatePath = '/app-llm/create'
    skuListPath = '/app-llm-sku'
    skuCreatePath = '/app-llm-sku/create'
    skuImportFromCommunityPath = '/app-llm-sku/import-from-community'
  } else if (isDesktopType) {
    instanceListPath = '/app-desktop'
    instanceCreatePath = '/app-desktop/create'
    skuListPath = '/app-desktop-sku'
    skuCreatePath = '/app-desktop-sku/create'
    skuImportFromCommunityPath = '/app-desktop-sku/import-from-community'
  } else if (isInferenceType) {
    skuImportFromModelSetsPath = '/llm-sku/import-from-model-sets'
    skuImportFromHuggingfacePath = '/llm-sku/import-from-huggingface'
  }

  return {
    isApplyType,
    isDesktopType,
    isInferenceType,
    llmTypes,
    instanceListPath,
    instanceCreatePath,
    deploymentListPath,
    deploymentCreatePath,
    skuListPath,
    skuCreatePath,
    skuImportFromCommunityPath,
    skuImportFromModelSetsPath,
    skuImportFromHuggingfacePath,
  }
}

export function getLlmSkuTypeFilter (ctx) {
  if (ctx.isDesktopType) {
    return 'llm_type.in(desktop)'
  }
  if (ctx.isApplyType) {
    return 'llm_type.notin(vllm,ollama,sglang,desktop)'
  }
  return 'llm_type.in(vllm,ollama,sglang)'
}

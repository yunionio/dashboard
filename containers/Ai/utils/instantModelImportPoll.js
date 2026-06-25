export const POLL_INTERVAL_MS = 3000

const INFERENCE_LLM_TYPES = ['vllm', 'ollama', 'sglang']

function parseLlmSpec (sku) {
  const raw = sku?.llm_spec
  if (!raw) return null
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch (e) {
      return null
    }
  }
  return null
}

function preferredModelFromSku (sku) {
  const llmType = sku?.llm_type
  const spec = parseLlmSpec(sku)
  if (!spec) return ''
  if (llmType && spec[llmType]?.preferred_model) {
    return String(spec[llmType].preferred_model).trim()
  }
  for (let i = 0; i < INFERENCE_LLM_TYPES.length; i++) {
    const key = INFERENCE_LLM_TYPES[i]
    const block = spec[key]
    if (block?.preferred_model) {
      return String(block.preferred_model).trim()
    }
  }
  return ''
}

function parseOllamaPreferredModel (preferred) {
  const s = String(preferred).trim()
  if (!s) return null
  const idx = s.indexOf(':')
  if (idx >= 0) {
    return {
      model_name: s.slice(0, idx),
      model_tag: s.slice(idx + 1) || 'latest',
      llm_type: 'ollama',
    }
  }
  return { model_name: s, model_tag: 'latest', llm_type: 'ollama' }
}

export function resolveInstantModelIdFromSku (sku) {
  const ids = sku?.mounted_models
  if (Array.isArray(ids) && ids.length > 0) {
    const id = String(ids[0] || '').trim()
    if (id) return id
  }
  const mounted = sku?.mounted_model_details || []
  if (mounted.length > 0 && mounted[0]?.id) {
    return String(mounted[0].id)
  }
  return ''
}

export function resolveInstantModelQueryFromSku (sku) {
  if (!sku) return null

  const llmType = sku.llm_type
  if (sku.huggingface_repo_id) {
    return {
      model_name: sku.huggingface_repo_id,
      model_tag: sku.huggingface_filename || 'main',
      llm_type: llmType,
    }
  }

  const preferred = preferredModelFromSku(sku)
  if (preferred) {
    if (llmType === 'ollama' || sku.source === 'ollama') {
      return parseOllamaPreferredModel(preferred)
    }
    return {
      model_name: preferred,
      model_tag: sku.huggingface_filename || 'main',
      llm_type: llmType,
    }
  }

  return null
}

export async function findInstantModelByQuery (manager, query, scope) {
  if (!query?.model_name) return null
  const listRes = await manager.list({
    params: {
      scope,
      llm_type: query.llm_type,
      model_name: query.model_name,
      limit: 20,
      details: true,
    },
  })
  const items = listRes.data?.data || []
  const wantTag = query.model_tag || 'main'
  let matched = items.filter((item) => {
    const nameOk = item.model_name === query.model_name
    const tagOk = (item.model_tag || 'main') === wantTag
    return nameOk && tagOk
  })
  if (matched.length === 0) {
    matched = items.filter(item => item.model_name === query.model_name)
  }
  if (matched.length === 0) return null
  matched.sort((a, b) => {
    const ta = new Date(a.created_at || 0).getTime()
    const tb = new Date(b.created_at || 0).getTime()
    return tb - ta
  })
  return matched[0]
}

async function getInstantModelDetail (manager, id, scope) {
  const res = await manager.get({
    id,
    params: {
      scope,
      details: true,
      _t: Date.now(),
    },
  })
  return res.data
}

/** 优先 get(mounted_models id)，否则 list 匹配后 get */
export async function fetchInstantModelForSku (manager, sku, scope) {
  const instantModelId = resolveInstantModelIdFromSku(sku)
  if (instantModelId) {
    return getInstantModelDetail(manager, instantModelId, scope)
  }

  const query = resolveInstantModelQueryFromSku(sku)
  if (!query) return null

  const found = await findInstantModelByQuery(manager, query, scope)
  if (!found?.id) return found

  return getInstantModelDetail(manager, found.id, scope)
}

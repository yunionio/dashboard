/**
 * 模型目录 set / spec 与 llm_type、部署/导入请求参数的映射
 */

import { getDefaultPortMappingsForType, getDefaultSkuSpecForType } from '@Ai/views/llm-sku/constants/llmTypeConfig'
import { normalizeCatalogBackendParameters } from '@Ai/utils/backendParameters'
import { createEmptyDeviceRow, expandRowsToDevices } from '@Ai/utils/deviceFormUtils'

export const CATALOG_IMPORT_STORAGE_KEY = 'llm_catalog_import_context'

/** 目录 / HF 部署表单默认值 */
export function createDefaultDeployForm () {
  return {
    name: '',
    llm_image_id: '',
    network: '',
    deviceRows: [createEmptyDeviceRow()],
    replicas: 1,
    cpu: 4,
    memory: 8192,
    disk_size: 20480,
  }
}

/** 根据 catalog spec 预填部署表单（model-sets / HF 共用） */
export function applyCatalogSpecToDeployForm (deployForm, spec, catalogSet, llmType) {
  if (!deployForm || !spec || !llmType) return
  const defaults = getDefaultSkuSpecForType(llmType) || {}
  const rec = spec.recommended || {}
  deployForm.name = defaultNameFromSpec(spec, catalogSet, llmType)
  deployForm.cpu = rec.cpu || spec.cpu || defaults.cpu || 4
  deployForm.memory = rec.memory || spec.memory || defaults.memory || 8192
  deployForm.disk_size = rec.disk_size || rec.volume_size_mb || spec.disk_size || defaults.volume_size_mb || 20480
  if (rec.llm_image_id) {
    deployForm.llm_image_id = rec.llm_image_id
  }
}

/**
 * 构造 POST llm_deployments 请求体（仅走 model_spec + sku_spec，不查 llm_instant_models）
 */
export function buildCatalogDeploymentPayload (deployForm, spec, llmType) {
  const skuSpec = {
    llm_image_id: deployForm.llm_image_id,
    llm_type: llmType,
    cpu: deployForm.cpu,
    memory: deployForm.memory,
    volumes: [{ size_mb: deployForm.disk_size, storage_type: 'local' }],
  }
  const expanded = expandRowsToDevices(deployForm.deviceRows)
  if (expanded.length) {
    skuSpec.devices = expanded
  }

  const typeSpec = {}
  if (llmType === 'vllm' || llmType === 'sglang') {
    const preferred = getPreferredModelFromSpec(spec)
    if (preferred) typeSpec.preferred_model = preferred
  }
  const catalogBackendParams = normalizeCatalogBackendParameters(spec)
  if (catalogBackendParams.length > 0) {
    skuSpec.backend_parameters = catalogBackendParams
  }
  if (Object.keys(typeSpec).length > 0) {
    skuSpec.llm_spec = { [llmType]: typeSpec }
  }

  const defaultPorts = getDefaultPortMappingsForType(llmType)
  if (defaultPorts.length) {
    skuSpec.port_mappings = defaultPorts.map(pm => ({
      protocol: pm.protocol,
      container_port: pm.container_port,
    }))
  }

  const payload = {
    name: deployForm.name,
    replicas: 1,
    placement_strategy: 'spread',
    access_policy: 'authed',
    auto_start: true,
    nets: [{ network: deployForm.network }],
    sku_spec: skuSpec,
  }
  const modelSpec = buildModelSpec(spec, llmType)
  if (modelSpec) payload.model_spec = modelSpec
  return payload
}

/** model-sets 目录 spec 的唯一标识，优先 id（与 llm_model_spec_id 一致） */
export function getCatalogSpecId (spec) {
  if (!spec) return ''
  return spec.id || spec.spec_id || ''
}

const BACKEND_LLM_TYPE_MAP = {
  vllm: 'vllm',
  ollama: 'ollama',
  sglang: 'sglang',
}

export function backendToLlmType (backend) {
  const k = String(backend || '').toLowerCase().replace(/\s+/g, '')
  return BACKEND_LLM_TYPE_MAP[k] || 'vllm'
}

export function isCatalogInferenceBackend (backend) {
  const t = backendToLlmType(backend)
  return t === 'vllm' || t === 'ollama' || t === 'sglang'
}

/**
 * 统一读取 spec 的后端字段（model-sets / HF 字段名可能不同）
 */
export function resolveCatalogSpecBackend (spec, fallbackBackend = '') {
  if (!spec) return String(fallbackBackend || '')
  return spec.backend || spec.engine || fallbackBackend || ''
}

/**
 * 解析可部署的 llm_type；HF 部署用 selectedBackend 兜底
 */
export function resolveCatalogLlmType (spec, options = {}) {
  const { fallbackBackend = '' } = options
  const backend = resolveCatalogSpecBackend(spec, fallbackBackend)
  if (!backend || !isCatalogInferenceBackend(backend)) return ''
  return backendToLlmType(backend)
}

/**
 * 部署/导入用的 model_spec（与 sections/catalog-model-sets、llm-deployment/create 一致）
 */
export function buildModelSpec (spec, llmType) {
  if (!spec) return null
  const src = spec.source
  if (src === 'ollama') {
    const name = spec.ollama_model
    const tag = spec.ollama_tag || 'latest'
    if (!name) return null
    return {
      llm_type: 'ollama',
      source: '',
      model_name: name,
      model_tag: tag,
    }
  }
  const repo = spec.huggingface_repo_id || spec.model_scope_model_id
  if (!repo) return null
  const ms = { llm_type: llmType, model_name: repo, repo_id: repo }
  if (src === 'huggingface') {
    ms.source = 'huggingface'
    ms.model_tag = spec.huggingface_filename || 'main'
  } else if (src === 'model_scope') {
    ms.source = 'model_scope'
    ms.model_tag = 'master'
    ms.revision = 'master'
    ms.file_path = spec.model_scope_file_path || ''
  } else {
    return null
  }
  return ms
}

export function getPreferredModelFromSpec (spec) {
  if (!spec) return ''
  if (spec.huggingface_repo_id) return spec.huggingface_repo_id
  if (spec.model_scope_model_id) return spec.model_scope_model_id
  if (spec.name) return spec.name
  if (spec.label) return spec.label
  return ''
}

/** 导入时解析 HuggingFace 仓库 ID（HF / model-sets 共用） */
export function resolveHuggingfaceRepoId (spec) {
  if (!spec) return ''
  return (
    spec.huggingface_repo_id ||
    spec.repo_id ||
    spec.model_scope_model_id ||
    spec.spec_id ||
    spec.name ||
    spec.label ||
    ''
  )
}

function resolveImportCategories (spec, catalogSet) {
  const fromSet = catalogSet?.categories
  if (Array.isArray(fromSet) && fromSet.length > 0) {
    return [...fromSet]
  }
  const fromSpec = spec?.categories
  if (Array.isArray(fromSpec) && fromSpec.length > 0) {
    return [...fromSpec]
  }
  const tag = spec?.pipeline_tag || spec?.category || ''
  if (tag === 'feature-extraction' || tag === 'embedding') {
    return ['embedding', 'llm']
  }
  return ['llm']
}

function resolveOllamaModelName (spec) {
  if (!spec) return ''
  return spec.ollama_model || spec.name || spec.label || spec.spec_id || ''
}

/** llm_spec 内层 key 与 llm_type 一致；preferred_model 来自目录 */
function buildImportLlmSpec (llmType, preferredModel) {
  return {
    [llmType]: {
      preferred_model: preferredModel,
    },
  }
}

/**
 * HF / ModelScope / model-sets 导入 llm_skus：附带 source、categories、model_spec、llm_spec 等字段。
 */
export function buildSkuImportParams (spec, llmType, options = {}) {
  const { catalogSet = null } = options
  if (!spec || !llmType) return {}

  const categories = resolveImportCategories(spec, catalogSet)

  if (llmType === 'ollama' || spec.source === 'ollama') {
    const modelName = resolveOllamaModelName(spec)
    if (!modelName) return {}
    const modelTag = spec.ollama_tag || 'latest'
    return {
      source: 'ollama',
      categories,
      model_spec: {
        model_name: modelName,
        model_tag: modelTag,
        llm_type: 'ollama',
        source: 'ollama',
      },
      llm_spec: buildImportLlmSpec('ollama', modelName),
    }
  }

  const src = spec.source || 'huggingface'
  if (src === 'model_scope') {
    const modelId = spec.model_scope_model_id || spec.repo_id || resolveHuggingfaceRepoId(spec)
    if (!modelId) return {}
    const filePath = spec.model_scope_file_path || ''
    const revision = 'master'
    return {
      source: 'model_scope',
      model_scope_model_id: modelId,
      model_scope_file_path: filePath,
      categories,
      model_spec: {
        model_name: modelId,
        model_tag: revision,
        llm_type: llmType,
        source: 'model_scope',
        repo_id: modelId,
        revision,
        file_path: filePath,
      },
      llm_spec: buildImportLlmSpec(llmType, modelId),
    }
  }

  const repoId = resolveHuggingfaceRepoId(spec)
  if (!repoId) return {}

  const revision = spec.huggingface_filename || 'main'
  return {
    source: 'huggingface',
    huggingface_repo_id: repoId,
    categories,
    model_spec: {
      model_name: repoId,
      model_tag: revision,
      llm_type: llmType,
      source: 'huggingface',
      repo_id: repoId,
      revision,
    },
    llm_spec: buildImportLlmSpec(llmType, repoId),
  }
}

/** @deprecated use buildSkuImportParams */
export function buildHuggingfaceSkuImportParams (spec, llmType, options = {}) {
  return buildSkuImportParams(spec, llmType, options)
}

function sanitizeCatalogNamePart (value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** 目录 / HF spec 对应的模型名（不含 llm_type） */
export function resolveCatalogModelName (spec, set) {
  if (set?.name) return set.name
  if (spec?.source === 'ollama') {
    const model = spec.ollama_model || ''
    const tag = spec.ollama_tag
    if (model && tag) return `${model}:${tag}`
    if (model) return model
  }
  const preferred = getPreferredModelFromSpec(spec)
  if (preferred) return preferred
  return spec?.name || spec?.label || 'model'
}

export function defaultNameFromSpec (spec, set, llmType = '') {
  const modelPart = sanitizeCatalogNamePart(resolveCatalogModelName(spec, set))
  const typePart = sanitizeCatalogNamePart(llmType)
  const rand = Math.random().toString(36).slice(2, 6)
  if (typePart) {
    return `${modelPart}-${typePart}-${rand}`
  }
  return `${modelPart}-${rand}`
}

/**
 * 目录 spec 若已有关联秒装模型，直接返回其 id 列表。
 */
export function getCatalogMountedModelIds (spec) {
  if (!spec) return null
  if (spec.instant_model_id) return [spec.instant_model_id]
  if (spec.mounted_model_id) return [spec.mounted_model_id]
  if (Array.isArray(spec.mounted_models) && spec.mounted_models.length > 0) {
    return spec.mounted_models
      .map(v => (typeof v === 'string' ? v : v?.id))
      .filter(Boolean)
  }
  return null
}

/**
 * 按目录 spec 构造 llm_instant_models 创建参数（用于解析 mounted_models id）。
 */
export function buildInstantModelCreateData (spec, llmType, generateName) {
  if (!spec) return null
  const src = spec.source
  if (src === 'ollama') {
    const name = spec.ollama_model
    const tag = spec.ollama_tag || 'latest'
    if (!name) return null
    return {
      generate_name: generateName,
      llm_type: 'ollama',
      model_name: name,
      model_tag: tag,
    }
  }
  const repo = spec.huggingface_repo_id || spec.model_scope_model_id
  if (!repo) return null
  const data = {
    generate_name: generateName,
    llm_type: llmType,
    model_name: repo,
    model_tag: spec.huggingface_filename || spec.model_scope_file_path || 'main',
  }
  if (src === 'huggingface') {
    data.source = 'huggingface'
    data.repo_id = repo
  } else if (src === 'model_scope') {
    data.source = 'model_scope'
    data.repo_id = repo
  } else {
    return null
  }
  return data
}

export function catalogTypeUsesMountedModels (llmType) {
  return llmType === 'vllm' || llmType === 'sglang' || llmType === 'ollama'
}

/**
 * 目录导入/部署：由已选 spec 生成模型相关请求字段，无需用户在表单再选「挂载模型 / 首选模型」。
 * @returns {{ model_spec?: object, llm_spec?: object, mounted_models?: string[] }}
 */
export function buildCatalogSkuModelParams (spec, llmType, mountedModelIds = null) {
  const out = {}
  const modelSpec = buildModelSpec(spec, llmType)
  if (modelSpec) out.model_spec = modelSpec

  if (llmType === 'vllm' || llmType === 'sglang') {
    const preferred = getPreferredModelFromSpec(spec)
    if (preferred) {
      out.llm_spec = { [llmType]: { preferred_model: preferred } }
    }
  }

  const presetIds = mountedModelIds || getCatalogMountedModelIds(spec)
  if (presetIds && presetIds.length > 0) {
    out.mounted_models = presetIds
  }
  return out
}

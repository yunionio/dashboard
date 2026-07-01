/**
 * ModelScope 导入：构造与模型目录 catalog 兼容的 set / spec，供 LlmSkuCreateForm 复用。
 */

import { buildHfCatalogSetMeta } from '@Ai/utils/catalogDrawerMeta'

export function buildMsCatalogSet (repoItem, modelId) {
  return buildHfCatalogSetMeta({
    ...repoItem,
    id: modelId,
    pipeline_tag: repoItem?.pipeline_tag,
  }, modelId)
}

function inferMsCategories (repoItem) {
  const tag = repoItem?.pipeline_tag || ''
  if (tag === 'feature-extraction' || tag === 'sentence-similarity') {
    return ['embedding', 'llm']
  }
  return ['llm']
}

/** @param {string} modelId @param {string} backend vLLM | SGLang */
export function buildMsCatalogSpec (modelId, backend = 'vLLM', repoItem = null) {
  if (!modelId) return null
  return {
    id: modelId,
    spec_id: modelId,
    source: 'model_scope',
    model_scope_model_id: modelId,
    model_scope_file_path: '',
    backend,
    name: modelId,
    label: modelId,
    pipeline_tag: repoItem?.pipeline_tag,
    categories: inferMsCategories(repoItem),
  }
}

/** ModelScope README 下载 URL（经 llm_instant_models/proxy 转发） */
export function buildMsReadmeProxyUrl (modelId) {
  if (!modelId) return ''
  const parts = String(modelId).split('/').filter(Boolean).map(encodeURIComponent)
  if (parts.length < 2) return ''
  return `https://www.modelscope.cn/api/v1/models/${parts.join('/')}/repo?FilePath=README.md`
}

export function modelIdOf (item) {
  if (!item) return ''
  return item.model_id || item.modelId || item.id || item.path || item.name || ''
}

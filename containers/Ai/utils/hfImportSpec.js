/**
 * Hugging Face 导入：构造与模型目录 catalog 兼容的 set / spec，供 LlmSkuCreateForm 复用。
 */

import { buildHfCatalogSetMeta } from '@Ai/utils/catalogDrawerMeta'

export function buildHfCatalogSet (repoItem, repoId) {
  return buildHfCatalogSetMeta(repoItem, repoId)
}

function inferHfCategories (repoItem) {
  const tag = repoItem?.pipeline_tag || ''
  if (tag === 'feature-extraction') return ['embedding', 'llm']
  return ['llm']
}

/** @param {string} repoId @param {string} backend vLLM | SGLang */
export function buildHfCatalogSpec (repoId, backend = 'vLLM', repoItem = null) {
  if (!repoId) return null
  return {
    id: repoId,
    spec_id: repoId,
    source: 'huggingface',
    huggingface_repo_id: repoId,
    huggingface_filename: 'main',
    backend,
    name: repoId,
    label: repoId,
    pipeline_tag: repoItem?.pipeline_tag,
    categories: inferHfCategories(repoItem),
  }
}

/**
 * Drawer 顶部模型介绍 + 元信息表格的通用数据构造
 */

function formatDate (val) {
  if (!val) return ''
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return String(val)
  return d.toISOString().slice(0, 10)
}

export function formatCatalogSetSize (set) {
  if (!set || set.size == null || set.size === '') return ''
  if (typeof set.size === 'string') return set.size
  const unit = set.size_unit || 'B'
  return `${set.size}${unit}`
}

export function getCatalogSetHomeUrl (set) {
  if (!set) return ''
  return set.home || set.homepage || ''
}

/** model-sets catalog set */
export function normalizeCatalogSetMeta (set) {
  if (!set) return null
  return {
    description: set.description || '',
    size: set.size,
    size_unit: set.size_unit,
    licenses: set.licenses || [],
    release_date: set.release_date || '',
    capabilities: set.capabilities || [],
    home: getCatalogSetHomeUrl(set),
  }
}

/** 社区 tag 展平项 */
export function buildMetaFromCommunityTag (tag) {
  if (!tag) return null
  const capabilities = Array.isArray(tag.capabilities) ? [...tag.capabilities] : []
  if (tag.context_length) {
    const ctxLabel = String(tag.context_length).includes('context')
      ? String(tag.context_length)
      : `context/${tag.context_length}`
    if (!capabilities.includes(ctxLabel)) {
      capabilities.unshift(ctxLabel)
    }
  }
  return {
    description: tag.description || '',
    size: tag.model_size || '',
    licenses: [],
    release_date: '',
    capabilities,
    home: tag.model_name ? `https://ollama.com/library/${tag.model_name}` : '',
  }
}

function buildHfCapabilities (repoItem) {
  const caps = []
  if (repoItem?.pipeline_tag) caps.push(repoItem.pipeline_tag)
  const tags = Array.isArray(repoItem?.tags) ? repoItem.tags : []
  tags.slice(0, 8).forEach(t => {
    const s = typeof t === 'string' ? t : (t?.id || t?.name || '')
    if (s && !caps.includes(s)) caps.push(s)
  })
  const cats = Array.isArray(repoItem?.categories) ? repoItem.categories : []
  cats.forEach(c => {
    if (c && !caps.includes(c)) caps.push(c)
  })
  return caps
}

function inferHfCategories (repoItem) {
  const tag = repoItem?.pipeline_tag || ''
  if (tag === 'feature-extraction') return ['embedding', 'llm']
  return ['llm']
}

function buildHfDescription (repoItem, repoId) {
  const raw = repoItem?.cardData ?? repoItem?.description
  if (raw != null) {
    if (typeof raw === 'string' && raw.trim()) return raw.trim()
    if (typeof raw === 'object') {
      const text = raw.summary || raw.description || raw.__description__
      if (text != null && String(text).trim()) return String(text).trim()
    }
  }
  const parts = []
  if (repoItem?.pipeline_tag) parts.push(repoItem.pipeline_tag)
  if (repoItem?.downloads != null) parts.push(`downloads: ${repoItem.downloads}`)
  if (repoItem?.likes != null) parts.push(`likes: ${repoItem.likes}`)
  return parts.length ? parts.join(' · ') : (repoId || '')
}

/** 增强 HF catalog set，供 meta 面板与 SKU 表单复用 */
export function buildHfCatalogSetMeta (repoItem, repoId) {
  const id = repoId || ''
  const licenses = []
  if (repoItem?.license) licenses.push(repoItem.license)
  if (Array.isArray(repoItem?.licenses)) {
    repoItem.licenses.forEach(l => l && licenses.push(l))
  }
  return {
    name: id,
    description: buildHfDescription(repoItem, id),
    categories: inferHfCategories(repoItem),
    size: repoItem?.safetensors?.total || repoItem?.params || '',
    size_unit: '',
    licenses,
    release_date: formatDate(repoItem?.lastModified || repoItem?.createdAt),
    capabilities: buildHfCapabilities(repoItem),
    home: id ? `https://huggingface.co/${id}` : '',
    homepage: id ? `https://huggingface.co/${id}` : '',
  }
}

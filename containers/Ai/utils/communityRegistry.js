export function toSafeName (fullName) {
  return (fullName || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
}

/** 按 tag 展平：每个 tag 一条（如 qwen3-vl:8b） */
export function buildCommunityTagItems (doc) {
  const models = Array.isArray(doc?.ollama) ? doc.ollama : []
  const items = []
  models.forEach(model => {
    const modelName = model?.name
    const description = model?.description || ''
    if (!modelName) return
    ;(Array.isArray(model?.tags) ? model.tags : []).forEach(tag => {
      const tagName = tag?.name
      if (!tagName) return
      items.push({
        full_name: `${modelName}:${tagName}`,
        model_name: modelName,
        tag_name: tagName,
        description,
        capabilities: tag?.capabilities || [],
        context_length: tag?.context_length,
        model_size: tag?.model_size,
        is_latest: !!tag?.is_latest,
      })
    })
  })
  return items
}

export function getCommunityTagId (tag) {
  return tag?.full_name || ''
}

export function repoIdOf (item) {
  if (!item) return ''
  return item.repo_id || item.id || item.modelId || item.model_id || item.name || ''
}

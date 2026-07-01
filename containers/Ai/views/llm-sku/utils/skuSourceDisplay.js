import i18n from '@/locales'

const SOURCE_LABEL_KEYS = {
  huggingface: 'aice.llm_sku.source.huggingface',
  model_scope: 'aice.llm_sku.source.model_scope',
  local_path: 'aice.llm_sku.source.local_path',
  ollama: 'aice.llm_sku.source.ollama',
}

/** Human-readable label for llm_sku.source (huggingface / model_scope / local_path / ollama). */
export function getLlmSkuSourceLabel (source) {
  const raw = String(source ?? '').trim()
  if (!raw) return ''
  const key = SOURCE_LABEL_KEYS[raw] || SOURCE_LABEL_KEYS[raw.toLowerCase()]
  if (key) {
    const label = i18n.t(key)
    if (label && label !== key) return label
  }
  return raw
}

export function getSourceTableColumn () {
  return {
    field: 'source',
    title: i18n.t('aice.llm_deployment.source'),
    formatter: ({ row }) => getLlmSkuSourceLabel(row.source) || '-',
  }
}

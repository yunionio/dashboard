import { renderVisualProviderLinkCell } from '@Ai/utils/aiproxyLlmLinkColumns'

export const VISUAL_EXTENSION_PROVIDER_KEYS = ['deepseek']

/** @param {{ provider_key?: string }} providerRow */
export function shouldShowAiModelVisualColumn (providerRow) {
  const key = String(providerRow?.provider_key || '').trim().toLowerCase()
  return VISUAL_EXTENSION_PROVIDER_KEYS.includes(key)
}

/** @param {Record<string, any>} row */
export function isAiModelVisualActive (row) {
  if (!row) return false
  if (row.visual_active === true || row.visual_active === 'true') return true
  if (row.visual_active === false || row.visual_active === 'false') return false
  const enabled = !!row.config?.extensions?.visual?.enabled
  const providerId = String(row.visual_provider_id || '').trim()
  const modelKey = String(row.visual_model_key || '').trim()
  return enabled && providerId !== '' && modelKey !== ''
}

/** @param {import('vue').default} vm */
export function getAiModelVisualTableColumn (vm) {
  const formatText = row => {
    const active = isAiModelVisualActive(row)
    return active ? vm.$t('status.enabled.true') : vm.$t('status.enabled.false')
  }
  return {
    field: 'visual_active',
    title: vm.$t('aice.aiproxy.visual_supported'),
    minWidth: 110,
    slots: {
      default: ({ row }, h) => {
        const active = isAiModelVisualActive(row)
        const text = formatText(row)
        if (!active) return text
        const model = row.visual_model_key || '-'
        const tip = vm.$t('aice.aiproxy.visual_supported_tip', [
          row.visual_provider_name || row.visual_provider_id || '-',
          model,
        ])
        return [
          <a-tooltip title={tip}>
            <span>{text}</span>
          </a-tooltip>,
        ]
      },
    },
    formatter: ({ row }) => formatText(row),
  }
}

/** DeepSeek provider model list: clickable visual provider column. */
export function getAiModelVisualProviderLinkColumn (vm) {
  return {
    field: 'visual_provider_id',
    title: vm.$t('aice.aiproxy.visual_provider_id'),
    minWidth: 160,
    slots: {
      default: ({ row }, h) => {
        if (!isAiModelVisualActive(row)) return '-'
        return renderVisualProviderLinkCell(vm, row)
      },
    },
    formatter: ({ row }) => {
      if (!isAiModelVisualActive(row)) return '-'
      return row.visual_provider_name || row.visual_provider_id || '-'
    },
  }
}

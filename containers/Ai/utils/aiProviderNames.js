import { Manager } from '@/utils/manager'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import { isKnownAiproxyProviderKey } from '@Ai/utils/aiproxyProviderIcon'

const metaCache = new Map()

export function getAiProviderDisplayName (row, nameMap = {}) {
  if (!row?.ai_provider_id) return '-'
  return row.ai_provider_name || nameMap[row.ai_provider_id] || row.ai_provider_id
}

export function getAiProviderKeyFromRow (row, keyMap = {}) {
  if (!row) return ''
  const direct = String(row.provider_key || row.ai_provider_key || '').trim().toLowerCase()
  if (direct) return direct
  const id = row.ai_provider_id
  if (id && keyMap[id]) return String(keyMap[id]).trim().toLowerCase()
  // Catalog rows often use provider_key as id/name (e.g. id "deepseek") when meta fetch misses.
  for (const candidate of [row.ai_provider_name, row.ai_provider_id]) {
    const key = String(candidate || '').trim().toLowerCase()
    if (isKnownAiproxyProviderKey(key)) return key
  }
  return ''
}

export function getVisualProviderKeyFromRow (row, keyMap = {}) {
  if (!row) return ''
  const direct = String(row.visual_provider_key || '').trim().toLowerCase()
  if (direct) return direct
  const id = row.visual_provider_id
  if (id && keyMap[id]) return String(keyMap[id]).trim().toLowerCase()
  for (const candidate of [row.visual_provider_name, row.visual_provider_id]) {
    const key = String(candidate || '').trim().toLowerCase()
    if (isKnownAiproxyProviderKey(key)) return key
  }
  return ''
}

/** Batch resolve ai_provider id -> { name, provider_key }. */
export async function fetchAiProviderMetaMap (ids, { scope, vm, useCache = true } = {}) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))]
  if (!uniqueIds.length) return {}

  const result = {}
  const missing = []

  uniqueIds.forEach(id => {
    if (useCache && metaCache.has(id)) {
      result[id] = { ...metaCache.get(id) }
    } else {
      missing.push(id)
    }
  })

  if (!missing.length) return result

  const listScope = scope || (vm ? getAiproxyResourceScope('ai_providers', vm) : 'system')

  try {
    const manager = new Manager('ai_providers')
    const { data: { data = [] } } = await manager.list({
      params: {
        scope: listScope,
        details: true,
        filter: `id.in(${missing.map(id => `'${id}'`).join(',')})`,
        limit: missing.length,
      },
    })
    ;(data || []).forEach(item => {
      if (!item?.id) return
      const meta = {
        name: item.name || item.id,
        provider_key: item.provider_key || '',
      }
      metaCache.set(item.id, meta)
      result[item.id] = meta
    })
  } catch (e) {
    // Caller falls back to provider id.
  }

  return result
}

/** Batch resolve ai_provider id -> name (catalog resources use system scope). */
export async function fetchAiProviderNameMap (ids, opts = {}) {
  const metaMap = await fetchAiProviderMetaMap(ids, opts)
  const result = {}
  Object.entries(metaMap).forEach(([id, meta]) => {
    if (meta?.name) result[id] = meta.name
  })
  return result
}

/** Batch resolve ai_provider id -> provider_key. */
export async function fetchAiProviderKeyMap (ids, opts = {}) {
  const metaMap = await fetchAiProviderMetaMap(ids, opts)
  const result = {}
  Object.entries(metaMap).forEach(([id, meta]) => {
    if (meta?.provider_key) result[id] = meta.provider_key
  })
  return result
}

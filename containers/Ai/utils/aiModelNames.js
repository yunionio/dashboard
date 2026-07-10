import { Manager } from '@/utils/manager'
import { uuid } from '@/utils/utils'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'

const nameCache = new Map()

export function getAiModelDisplayName (row, nameMap = {}) {
  if (!row?.ai_model_id) return '-'
  return row.ai_model_name || nameMap[row.ai_model_id] || row.ai_model_id
}

/** Batch resolve ai_model id -> name (catalog resources use system scope). */
export async function fetchAiModelNameMap (ids, { scope, vm, useCache = true } = {}) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))]
  if (!uniqueIds.length) return {}

  const result = {}
  const missing = []

  uniqueIds.forEach(id => {
    if (useCache && nameCache.has(id)) {
      result[id] = nameCache.get(id)
    } else {
      missing.push(id)
    }
  })

  if (!missing.length) return result

  const listScope = scope || (vm ? getAiproxyResourceScope('ai_models', vm) : 'system')

  try {
    const manager = new Manager('ai_models')
    const { data: { data = [] } } = await manager.list({
      params: {
        scope: listScope,
        filter: `id.in(${missing.map(id => `'${id}'`).join(',')})`,
        limit: missing.length,
        $t: `ai-model-name-${uuid()}`,
      },
    })
    ;(data || []).forEach(item => {
      if (item?.id && item.name) {
        nameCache.set(item.id, item.name)
        result[item.id] = item.name
      }
    })
  } catch (e) {
    // Caller falls back to model id.
  }

  return result
}

/** List model_key options for one ai_provider (for ai_key routing selects). */
export async function fetchProviderModelKeyOptions (providerId, { vm, scope } = {}) {
  const pid = String(providerId || '').trim()
  if (!pid) return []

  const listScope = scope || (vm ? getAiproxyResourceScope('ai_models', vm) : 'system')

  try {
    const manager = new Manager('ai_models')
    const { data: { data = [] } } = await manager.list({
      params: {
        scope: listScope,
        ai_provider_id: pid,
        limit: 500,
      },
    })
    const seen = new Set()
    const options = []
    ;(data || []).forEach(item => {
      const key = String(item?.model_key || '').trim()
      if (!key || seen.has(key)) return
      seen.add(key)
      options.push({ value: key, label: key })
    })
    options.sort((a, b) => a.label.localeCompare(b.label))
    return options
  } catch (e) {
    return []
  }
}

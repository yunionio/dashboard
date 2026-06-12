import { Manager } from '@/utils/manager'
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

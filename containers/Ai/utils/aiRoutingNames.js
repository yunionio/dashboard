import { Manager } from '@/utils/manager'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'

const nameCache = new Map()

export function getAiRoutingDisplayName (row, nameMap = {}) {
  const id = row?.aiproxy_routing_id || row?.ai_routing_id || row?.id
  if (!id) return '-'
  return row.ai_routing_name || row.name || nameMap[id] || id
}

/** Batch resolve ai_routing id -> name (project-scoped sharable resource). */
export async function fetchAiRoutingNameMap (ids, { vm, scope, useCache = true } = {}) {
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

  const listScope = scope || (vm ? getAiproxyResourceScope('ai_routings', vm) : undefined)

  try {
    const manager = new Manager('ai_routings')
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
    // Caller falls back to routing id.
  }

  return result
}

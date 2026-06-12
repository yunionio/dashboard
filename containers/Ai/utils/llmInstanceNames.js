import { Manager } from '@/utils/manager'

const nameCache = new Map()

export function getLlmInstanceDisplayName (row, nameMap = {}) {
  if (!row?.llm_id) return '-'
  return row.llm_name || nameMap[row.llm_id] || row.llm_id
}

/** Batch resolve llm (inference instance) id -> name via list API. */
export async function fetchLlmInstanceNameMap (ids, { scope, useCache = true } = {}) {
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

  try {
    const manager = new Manager('llms')
    const { data: { data = [] } } = await manager.list({
      params: {
        scope,
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
    // Caller falls back to instance id.
  }

  return result
}

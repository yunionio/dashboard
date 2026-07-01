import { Manager } from '@/utils/manager'

const nameCache = new Map()

/** Batch resolve host id -> name via list API. */
export async function fetchHostNameMap (ids, { scope, useCache = true } = {}) {
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
    const manager = new Manager('hosts')
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
    // Caller falls back to host id.
  }

  return result
}

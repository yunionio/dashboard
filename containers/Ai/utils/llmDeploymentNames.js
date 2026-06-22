import { Manager } from '@/utils/manager'

const nameCache = new Map()

export function getLlmDeploymentDisplayName (row, nameMap = {}) {
  if (!row?.llm_deployment_id) return '-'
  return row.llm_deployment_name || nameMap[row.llm_deployment_id] || row.llm_deployment_id
}

/**
 * Batch resolve llm_deployment id -> name via list API.
 * @returns {Promise<Record<string, string>>}
 */
export async function fetchLlmDeploymentNameMap (ids, { scope, useCache = true } = {}) {
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
    const manager = new Manager('llm_deployments', 'v1')
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
    // Caller falls back to deployment id.
  }

  return result
}

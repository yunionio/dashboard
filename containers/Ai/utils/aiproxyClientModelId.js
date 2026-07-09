/**
 * Client-facing model ids for aiproxy routing (mirrors backend list_models.go).
 */

import { Manager } from '@/utils/manager'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import { fetchRoutingModelsForRouting } from '@Ai/utils/aiProviderKind'

export const CLAUDE_CODE_ENV_MODEL_FIELDS = [
  { key: 'model', labelKey: 'aice.aiproxy.claude_env.ANTHROPIC_MODEL', envVar: 'ANTHROPIC_MODEL' },
  { key: 'opusModel', labelKey: 'aice.aiproxy.claude_env.ANTHROPIC_DEFAULT_OPUS_MODEL', envVar: 'ANTHROPIC_DEFAULT_OPUS_MODEL' },
  { key: 'sonnetModel', labelKey: 'aice.aiproxy.claude_env.ANTHROPIC_DEFAULT_SONNET_MODEL', envVar: 'ANTHROPIC_DEFAULT_SONNET_MODEL' },
  { key: 'haikuModel', labelKey: 'aice.aiproxy.claude_env.ANTHROPIC_DEFAULT_HAIKU_MODEL', envVar: 'ANTHROPIC_DEFAULT_HAIKU_MODEL' },
  { key: 'subagentModel', labelKey: 'aice.aiproxy.claude_env.CLAUDE_CODE_SUBAGENT_MODEL', envVar: 'CLAUDE_CODE_SUBAGENT_MODEL' },
]

function trim (s) {
  return String(s || '').trim()
}

export function clientFacingModelId (routing, entry, catalogModel) {
  if (entry) {
    const mp = trim(entry.model_pattern)
    if (mp && !mp.includes('*')) {
      return mp
    }
  }
  if (routing) {
    const mp = trim(routing.model_pattern)
    if (mp && !mp.includes('*')) {
      return mp
    }
  }
  if (catalogModel) {
    return trim(catalogModel.model_key)
  }
  return ''
}

export function hierarchicalClientModelId (routing, entry, catalogModel) {
  if (!routing) return ''
  const routeKey = trim(routing.model_key)
  if (!routeKey) return ''
  const part = clientFacingModelId(routing, entry, catalogModel)
  if (!part) return ''
  return `${routeKey}/${part}`
}

export function listClientModelIdForEntry (routing, entry, catalogModel) {
  const routeKey = trim(routing?.model_key)
  if (routeKey) {
    return hierarchicalClientModelId(routing, entry, catalogModel)
  }
  return clientFacingModelId(routing, entry, catalogModel)
}

/**
 * Build selectable client model options for access panel.
 * @returns {{ id: string, kind: 'flat'|'hierarchical', catalogKey: string, priority: number }[]}
 */
export function buildRoutingClientModelOptions ({
  routing = {},
  routingModels = [],
  catalogModelsById = {},
} = {}) {
  const entries = [...(routingModels || [])]
    .filter(e => e && e.enabled !== false)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))

  if (!entries.length) {
    const fallback = trim(routing.model_key)
    return fallback ? [{ id: fallback, kind: 'flat', catalogKey: '', priority: 0 }] : []
  }

  const routeKey = trim(routing.model_key)
  const seen = new Set()
  const options = []

  const push = (opt) => {
    if (!opt?.id || seen.has(opt.id)) return
    seen.add(opt.id)
    options.push(opt)
  }

  if (routeKey && entries.length > 1) {
    push({ id: routeKey, kind: 'flat', catalogKey: '', priority: -1 })
  }

  for (const entry of entries) {
    const catalog = catalogModelsById[entry.ai_model_id] || {}
    const catalogKey = trim(catalog.model_key)
    if (routeKey) {
      const hierarchical = hierarchicalClientModelId(routing, entry, catalog)
      if (hierarchical) {
        push({
          id: hierarchical,
          kind: 'hierarchical',
          catalogKey,
          priority: entry.priority || 0,
        })
      }
      continue
    }
    const flat = clientFacingModelId(routing, entry, catalog)
    if (flat) {
      push({
        id: flat,
        kind: 'flat',
        catalogKey,
        priority: entry.priority || 0,
      })
    }
  }

  if (!options.length && routeKey) {
    push({ id: routeKey, kind: 'flat', catalogKey: '', priority: 0 })
  }

  return options
}

export function defaultClientModelOption (options = []) {
  if (!options.length) return ''
  return options.find(o => o.kind === 'flat')?.id || options[0]?.id || ''
}

export function mergeClientModelOptions (...optionLists) {
  const seen = new Set()
  const options = []
  for (const list of optionLists) {
    for (const opt of list || []) {
      if (!opt?.id || seen.has(opt.id)) continue
      seen.add(opt.id)
      options.push(opt)
    }
  }
  return options
}

/**
 * Flat client model ids from LLM deployment aiproxy_bindings.
 */
export function buildDeploymentClientModelOptions (instances = []) {
  const seen = new Set()
  const options = []
  for (const item of instances || []) {
    const id = trim(item?.client_model_alias)
    if (!id || seen.has(id)) continue
    seen.add(id)
    options.push({
      id,
      kind: 'flat',
      catalogKey: id,
      priority: 0,
    })
  }
  return options
}

async function fetchCatalogModelsById (modelIds, vm) {
  const out = {}
  const ids = [...new Set((modelIds || []).filter(Boolean))]
  if (!ids.length) return out
  const manager = new Manager('ai_models')
  await Promise.all(ids.map(async (id) => {
    try {
      const { data } = await manager.get({
        id,
        params: { scope: getAiproxyResourceScope('ai_models', vm) },
      })
      if (data?.id) {
        out[data.id] = data
      }
    } catch (e) {
      // ignore missing catalog rows
    }
  }))
  return out
}

/**
 * Load routing detail, bindings, and client-facing model options.
 * @returns {{ options: object[], routing: object }}
 */
export async function fetchRoutingClientModelOptions (routingId, routing, vm) {
  routingId = trim(routingId)
  if (!routingId) {
    return { options: [], routing: routing || {} }
  }

  let routingData = routing && Object.keys(routing).length ? { ...routing } : {}
  if (!trim(routingData.model_key)) {
    try {
      const manager = new Manager('ai_routings')
      const { data } = await manager.get({
        id: routingId,
        params: { scope: getAiproxyResourceScope('ai_routings', vm) },
      })
      if (data?.id) {
        routingData = data
      }
    } catch (e) {
      // fall back to partial routing object
    }
  }

  const rows = await fetchRoutingModelsForRouting(routingId, vm)
  const enabledRows = [...(rows || [])]
    .filter(r => r && r.enabled !== false)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
  const modelIds = [...new Set(enabledRows.map(r => r.ai_model_id).filter(Boolean))]
  const catalogModelsById = await fetchCatalogModelsById(modelIds, vm)
  const options = buildRoutingClientModelOptions({
    routing: routingData,
    routingModels: enabledRows,
    catalogModelsById,
  })

  return { options, routing: routingData }
}

function findHierarchicalByKeyword (options, keyword) {
  const kw = String(keyword || '').toLowerCase()
  return options.find(o => o.kind === 'hierarchical' && String(o.catalogKey || '').toLowerCase().includes(kw))?.id || ''
}

/**
 * Map Claude Code env vars when routing has multiple catalog models.
 */
export function buildClaudeCodeModelEnv ({
  options = [],
  selectedModel = '',
  routing = {},
} = {}) {
  const flatId = trim(routing.model_key) || options.find(o => o.kind === 'flat')?.id || ''
  const selected = trim(selectedModel) || defaultClientModelOption(options) || flatId || 'your-model'

  const opus = findHierarchicalByKeyword(options, 'opus') || flatId || selected
  const sonnet = findHierarchicalByKeyword(options, 'sonnet') || flatId || selected
  const haiku = findHierarchicalByKeyword(options, 'haiku') || flatId || selected
  const subagent = findHierarchicalByKeyword(options, 'subagent') ||
    findHierarchicalByKeyword(options, 'haiku') ||
    sonnet ||
    selected

  const mainModel = selected || sonnet || flatId || 'your-model'

  return {
    model: mainModel,
    opusModel: opus,
    sonnetModel: sonnet,
    haikuModel: haiku,
    subagentModel: subagent,
  }
}

/** Default per-env model selections for Claude Code UI. */
export function defaultClaudeEnvModelSelections ({
  options = [],
  selectedModel = '',
  routing = {},
} = {}) {
  return buildClaudeCodeModelEnv({ options, selectedModel, routing })
}

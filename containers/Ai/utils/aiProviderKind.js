import { Manager } from '@/utils/manager'
import { uuid } from '@/utils/utils'
import { getAiproxyResourceScope, getAiproxySelectParams } from '@Ai/constants/aiproxyResources'
import { fetchAiModelNameMap } from '@Ai/utils/aiModelNames'
import { fetchLlmDeploymentNameMap } from '@Ai/utils/llmDeploymentNames'

export const PROVIDER_KIND_PUBLIC = 'public'
export const PROVIDER_KIND_DEPLOYMENT = 'deployment'
export const PROVIDER_KIND_DEFAULT = PROVIDER_KIND_PUBLIC

const metaCache = new Map()

export function inferProviderKind (provider) {
  if (!provider) return PROVIDER_KIND_PUBLIC
  const deploymentId = String(provider.llm_deployment_id || '').trim()
  return deploymentId ? PROVIDER_KIND_DEPLOYMENT : PROVIDER_KIND_PUBLIC
}

export function getProviderKindFilter (kind) {
  if (kind === PROVIDER_KIND_DEPLOYMENT) {
    return ['llm_deployment_id.isnotempty()']
  }
  return ['llm_deployment_id.isnullorempty()']
}

export function getProviderSelectParams (vm, kind, extra = {}) {
  return getAiproxySelectParams(vm, 'ai_providers', {
    details: true,
    filter: getProviderKindFilter(kind),
    ...extra,
  })
}

export function formatProviderKindLabel (vm, kind) {
  if (kind === PROVIDER_KIND_DEPLOYMENT) {
    return vm.$t('aice.aiproxy.provider_kind.deployment')
  }
  return vm.$t('aice.aiproxy.provider_kind.public')
}

export function providerKindOptions (vm) {
  return [
    { value: PROVIDER_KIND_PUBLIC, label: vm.$t('aice.aiproxy.provider_kind.public') },
    { value: PROVIDER_KIND_DEPLOYMENT, label: vm.$t('aice.aiproxy.provider_kind.deployment') },
  ]
}

export function deploymentProviderLabelFormat (item) {
  if (!item) return ''
  if (item.llm_deployment_name) {
    return item.llm_deployment_name
  }
  const name = String(item.name || '').trim()
  if (name && !isUuidLike(name)) {
    return name
  }
  return name
}

function isUuidLike (value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || '').trim())
}

export async function enrichProviderMetaDeploymentNames (metaMap, vm) {
  const deploymentIds = [...new Set(
    Object.values(metaMap || {}).map(meta => meta.llm_deployment_id).filter(Boolean),
  )]
  if (!deploymentIds.length) return
  const depMap = await fetchLlmDeploymentNameMap(deploymentIds, {
    scope: vm?.$store?.getters?.scope,
  })
  Object.values(metaMap).forEach(meta => {
    if (meta.llm_deployment_id && depMap[meta.llm_deployment_id]) {
      meta.llm_deployment_name = depMap[meta.llm_deployment_id]
    }
  })
}

function buildProviderExtraOpt (providerId, meta) {
  if (!providerId || !meta) return null
  return {
    id: providerId,
    name: meta.name || providerId,
    provider_key: meta.provider_key || '',
    llm_deployment_id: meta.llm_deployment_id || '',
    llm_deployment_name: meta.llm_deployment_name || '',
  }
}

/** Batch resolve ai_provider id -> { name, llm_deployment_id, llm_id }. */
export async function fetchAiProviderMetaMap (ids, { vm, useCache = true } = {}) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))]
  if (!uniqueIds.length) return {}

  const result = {}
  const missing = []

  uniqueIds.forEach(id => {
    if (useCache && metaCache.has(id)) {
      result[id] = metaCache.get(id)
    } else {
      missing.push(id)
    }
  })

  if (!missing.length) return result

  const listScope = vm ? getAiproxyResourceScope('ai_providers', vm) : 'system'

  try {
    const manager = new Manager('ai_providers')
    const { data: { data = [] } } = await manager.list({
      params: {
        scope: listScope,
        details: true,
        filter: `id.in(${missing.map(id => `'${id}'`).join(',')})`,
        limit: missing.length,
        // 与 BaseSelect 列表请求区分，避免同 url 并发被 http 层 cancel
        $t: `ai-provider-meta-${uuid()}`,
      },
    })
    ;(data || []).forEach(item => {
      if (!item?.id) return
      const meta = {
        id: item.id,
        name: item.name || item.id,
        provider_key: item.provider_key || '',
        llm_deployment_id: item.llm_deployment_id || '',
        llm_id: item.llm_id || '',
      }
      metaCache.set(item.id, meta)
      result[item.id] = meta
    })
    if (vm) {
      await enrichProviderMetaDeploymentNames(result, vm)
      Object.values(result).forEach(meta => {
        if (metaCache.has(meta.id)) {
          metaCache.set(meta.id, { ...meta })
        }
      })
    }
  } catch (e) {
    // Caller falls back to public kind.
  }

  return result
}

export async function fetchRoutingModelsForRouting (routingId, vm) {
  routingId = String(routingId || '').trim()
  if (!routingId) return []
  const manager = new Manager('ai_routing_models')
  const { data: { data = [] } } = await manager.list({
    params: {
      ai_routing_id: routingId,
      scope: getAiproxyResourceScope('ai_routing_models', vm),
      details: true,
      limit: 255,
    },
  })
  return data || []
}

export async function buildRoutingModelBindings (rows, { vm, useCache = false, keySeqRef } = {}) {
  const metaMap = await fetchAiProviderMetaMap(
    (rows || []).map(m => m.ai_provider_id),
    { vm, useCache },
  )
  const modelNameMap = await fetchAiModelNameMap(
    (rows || []).map(m => m.ai_model_id),
    { vm },
  )
  return (rows || []).map(m => {
    const fetched = metaMap[m.ai_provider_id] || {}
    const meta = {
      name: fetched.name || m.ai_provider_name || '',
      provider_key: fetched.provider_key || m.ai_provider_key || '',
      llm_deployment_id: fetched.llm_deployment_id || m.llm_deployment_id || '',
      llm_deployment_name: fetched.llm_deployment_name || m.llm_deployment_name || '',
    }
    const binding = {
      provider_kind: m.provider_kind || inferProviderKind({
        llm_deployment_id: meta.llm_deployment_id,
      }),
      ai_provider_id: m.ai_provider_id || '',
      ai_model_id: m.ai_model_id || '',
      priority: m.priority || 0,
    }
    const providerExtra = buildProviderExtraOpt(m.ai_provider_id, {
      name: meta.name || m.ai_provider_id,
      provider_key: meta.provider_key,
      llm_deployment_id: meta.llm_deployment_id,
      llm_deployment_name: meta.llm_deployment_name,
    })
    if (providerExtra) {
      binding._provider_extra = providerExtra
    }
    const modelName = modelNameMap[m.ai_model_id] || m.ai_model_name || m.model_key || ''
    if (m.ai_model_id && modelName) {
      binding._model_extra = {
        id: m.ai_model_id,
        name: modelName,
        model_key: m.model_key || '',
      }
    }
    if (keySeqRef) {
      binding._key = ++keySeqRef.value
    }
    return binding
  })
}

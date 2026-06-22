// aiproxy catalog resources are system-scoped (see onecloud/pkg/cloudcommon/db/modelbase.go ResourceScope).
// Project-scoped resources use the current dashboard scope (project/domain/system).
const SYSTEM_SCOPED_RESOURCES = new Set([
  'ai_providers',
  'ai_models',
  'ai_keys',
  'ai_routing_models',
])

export function getAiproxyResourceScope (resource, vm) {
  if (SYSTEM_SCOPED_RESOURCES.has(resource)) {
    return 'system'
  }
  return vm.$store.getters.scope
}

export function getAiproxySelectParams (vm, resource, extra = {}) {
  return {
    scope: getAiproxyResourceScope(resource, vm),
    ...extra,
  }
}

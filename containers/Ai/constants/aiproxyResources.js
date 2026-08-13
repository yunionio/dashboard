// Project-scoped aiproxy resources use the current dashboard scope (project/domain/system).
export function getAiproxyResourceScope (resource, vm) {
  return vm.$store.getters.scope
}

export function getAiproxySelectParams (vm, resource, extra = {}) {
  return {
    scope: getAiproxyResourceScope(resource, vm),
    ...extra,
  }
}

export function getAiproxyResourceProjectId (obj) {
  if (!obj || typeof obj !== 'object') return ''
  return obj.tenant_id || obj.project_id || ''
}

export function getAiproxyVirtualKeySelectParams (vm, extra = {}, owner) {
  const params = getAiproxySelectParams(vm, 'ai_virtual_keys', extra)
  const projectId = getAiproxyResourceProjectId(owner)
  if (projectId) {
    params.project_ids = [projectId]
  }
  return params
}

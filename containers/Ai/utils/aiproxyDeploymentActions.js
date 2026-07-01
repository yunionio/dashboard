export function formatDeploymentStatus (status, vm) {
  if (!status) return '-'
  const key = `status.llmDeployment.${status}`
  const text = vm.$t(key)
  return text === key ? status : text
}

export function formatAiproxySyncStatus (status, vm) {
  if (!status) return '-'
  const key = `status.llmDeploymentAiproxy.${status}`
  const text = vm.$t(key)
  return text === key ? status : text
}

// Prefer aiproxy_sync_status; fall back to legacy status values during upgrade.
export function resolveAiproxySyncStatus (row) {
  const syncStatus = row?.aiproxy_sync_status
  if (syncStatus) return syncStatus
  const legacy = row?.status
  switch (legacy) {
    case 'aiproxy_pending':
      return 'pending'
    case 'aiproxy_syncing':
      return 'syncing'
    case 'aiproxy_partial':
      return 'partial'
    case 'aiproxy_sync_failed':
      return 'failed'
    default:
      return row?.auto_register_aiproxy === false ? 'disabled' : ''
  }
}

export function isAiproxySyncInProgress (row) {
  const status = resolveAiproxySyncStatus(row)
  if (status === 'syncing') return true
  if (status === 'pending' && row?.auto_register_aiproxy !== false) return true
  return false
}

export function isAiproxyRegistered (row) {
  if (row?.auto_register_aiproxy === false) {
    const routingId = (row?.aiproxy_routing_id || '').trim()
    const bindings = Array.isArray(row?.aiproxy_bindings) ? row.aiproxy_bindings : []
    return !!routingId || bindings.length > 0
  }
  return true
}

const CREATING_STATUSES = [
  'creating',
  'importing_model',
  'creating_sku',
  'deleting',
  'import_model_failed',
  'create_sku_failed',
  'create_fail',
  'delete_fail',
]

export function getScaleMeta (row, vm) {
  if (CREATING_STATUSES.includes(row?.status)) {
    return {
      validate: false,
      tooltip: vm.$t('aice.llm_deployment.scale_disabled_invalid_status', [
        formatDeploymentStatus(row?.status, vm),
      ]),
    }
  }
  if (isAiproxySyncInProgress(row)) {
    return {
      validate: false,
      tooltip: vm.$t('aice.llm_deployment.aiproxy_sync_in_progress'),
    }
  }
  return { validate: true }
}

export function getRegisterAiproxyMeta (row, vm) {
  if (CREATING_STATUSES.includes(row?.status)) {
    return {
      validate: false,
      tooltip: vm.$t('aice.llm_deployment.scale_disabled_invalid_status', [
        formatDeploymentStatus(row?.status, vm),
      ]),
    }
  }
  if (isAiproxySyncInProgress(row)) {
    return {
      validate: false,
      tooltip: vm.$t('aice.llm_deployment.aiproxy_sync_in_progress'),
    }
  }
  return { validate: true }
}

export function getUnregisterAiproxyMeta (row, vm) {
  if (isAiproxySyncInProgress(row)) {
    return {
      validate: false,
      tooltip: vm.$t('aice.llm_deployment.aiproxy_sync_in_progress'),
    }
  }
  if (!isAiproxyRegistered(row)) {
    return {
      validate: false,
      tooltip: vm.$t('aice.llm_deployment.aiproxy_not_registered'),
    }
  }
  return { validate: true }
}

const RESTARTABLE_STATUSES = ['ready', 'partial', 'running', 'start_fail']

export function getRestartMeta (row, vm) {
  if (CREATING_STATUSES.includes(row?.status)) {
    return {
      validate: false,
      tooltip: vm.$t('aice.llm_deployment.restart_disabled_invalid_status', [
        formatDeploymentStatus(row?.status, vm),
      ]),
    }
  }
  if (isAiproxySyncInProgress(row)) {
    return {
      validate: false,
      tooltip: vm.$t('aice.llm_deployment.aiproxy_sync_in_progress'),
    }
  }
  if (!RESTARTABLE_STATUSES.includes(row?.status)) {
    const statusLabel = formatDeploymentStatus(row?.status, vm)
    return {
      validate: false,
      tooltip: vm.$t('aice.llm_deployment.restart_disabled_invalid_status', [statusLabel]),
    }
  }
  return { validate: true }
}

const SYNC_FORBIDDEN_STATUSES = [
  'creating',
  'importing_model',
  'creating_sku',
  'deleting',
  'start_delete',
  'deleted',
  'delete_fail',
  'delete_failed',
  'syncing',
]

export function getSyncStatusMeta (row, vm) {
  if (SYNC_FORBIDDEN_STATUSES.includes(row?.status)) {
    return {
      validate: false,
      tooltip: vm.$t('aice.llm_deployment.syncstatus_disabled_invalid_status', [
        formatDeploymentStatus(row?.status, vm),
      ]),
    }
  }
  return { validate: true }
}

const POST_ACTION_POLL_MS = 2000
const POST_ACTION_MAX_POLLS = 15

export function pollDeploymentDetailRefresh (vm, predicate) {
  return new Promise(resolve => {
    let count = 0
    const tick = () => {
      if (vm.$bus) {
        vm.$bus.$emit('refresh-detail')
      }
      count += 1
      setTimeout(() => {
        const done = typeof predicate === 'function' ? predicate() : false
        if (done || count >= POST_ACTION_MAX_POLLS) {
          resolve()
          return
        }
        tick()
      }, POST_ACTION_POLL_MS)
    }
    tick()
  })
}

export function performLlmDeploymentRegisterAiproxy (vm, row) {
  return vm.onManager('performAction', {
    id: row.id,
    managerArgs: {
      id: row.id,
      action: 'register-aiproxy',
      data: {},
    },
  })
}

export function performLlmDeploymentUnregisterAiproxy (vm, row) {
  return vm.onManager('performAction', {
    id: row.id,
    managerArgs: {
      id: row.id,
      action: 'unregister-aiproxy',
      data: {},
    },
  })
}

export function openUnregisterAiproxyConfirm (vm, row) {
  vm.createDialog('ConfirmDialog', {
    title: vm.$t('aice.llm_deployment.unregister_aiproxy'),
    content: vm.$t('aice.llm_deployment.unregister_aiproxy_confirm'),
    onOk: () => performLlmDeploymentUnregisterAiproxy(vm, row),
  })
}

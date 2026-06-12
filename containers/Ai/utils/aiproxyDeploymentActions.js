export function formatDeploymentAiproxyStatus (status, vm) {
  if (!status) return '-'
  const key = `status.llmDeployment.${status}`
  const text = vm.$t(key)
  return text === key ? status : text
}

export function isAiproxySyncInProgress (row) {
  const status = row?.status
  if (status === 'aiproxy_syncing') return true
  if (status === 'aiproxy_pending' && row?.auto_register_aiproxy !== false) return true
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

export function getRegisterAiproxyMeta (row, vm) {
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

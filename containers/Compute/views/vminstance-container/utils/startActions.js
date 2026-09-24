/**
 * 容器主机开机桥接（Compute 同步目录）
 * 优先加载 scope/utils/serverStartActions.js 的容器自定义开机；缺失则回退原逻辑
 */
function loadScopeStartModule () {
  try {
    const ctx = require.context('../../../../../scope', true, /[/\\]utils[/\\]serverStartActions\.js$/)
    const key = (ctx.keys() || []).find(k => /serverStartActions\.js$/.test(k))
    if (key) return ctx(key)
  } catch (e) { /* dashboard 无 GPU 扩展时忽略 */ }
  return null
}

const scopeStart = loadScopeStartModule()

function getDefaultStartAction (vm, obj) {
  return {
    label: vm.$t('compute.text_272'),
    permission: 'server_perform_start',
    action: () => {
      vm.onManager('performAction', {
        steadyStatus: 'running',
        id: obj.id,
        managerArgs: {
          action: 'start',
        },
      })
    },
    meta: () => {
      return {
        validate: obj.status === 'ready',
      }
    },
    hidden: () => vm.$isScopedPolicyMenuHidden('vminstance_container_hidden_menus.server_perform_start'),
  }
}

function getDefaultBatchStartAction (vm) {
  return {
    label: vm.$t('compute.text_272'),
    permission: 'server_perform_start',
    action: () => {
      const ids = vm.list.selectedItems.map(item => item.id)
      vm.list.onManager('batchPerformAction', {
        steadyStatus: 'running',
        id: ids,
        managerArgs: {
          action: 'start',
        },
      })
    },
    meta: () => {
      const ret = { validate: true, tooltip: null }
      if (vm.list.selectedItems.length === 0) {
        ret.validate = false
        return ret
      }
      const isStatusOk = vm.list.selectedItems.every(item => ['ready'].includes(item.status))
      if (!isStatusOk) {
        ret.validate = false
        return ret
      }
      return ret
    },
    hidden: () => vm.$isScopedPolicyMenuHidden('vminstance_container_hidden_menus.server_perform_start'),
  }
}

export function getStartAction (vm, obj) {
  if (scopeStart && typeof scopeStart.getContainerStartAction === 'function') {
    try {
      const custom = scopeStart.getContainerStartAction(vm, obj)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultStartAction(vm, obj)
}

export function getBatchStartAction (vm) {
  if (scopeStart && typeof scopeStart.getContainerBatchStartAction === 'function') {
    try {
      const custom = scopeStart.getContainerBatchStartAction(vm)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultBatchStartAction(vm)
}

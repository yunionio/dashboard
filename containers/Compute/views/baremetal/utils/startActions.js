/**
 * 裸金属开机桥接（Compute 同步目录）
 * 优先加载 scope 自定义开机预检；缺失则回退原逻辑
 */
import { commonUnabled } from '../../vminstance/utils'

function loadScopeStartModule () {
  try {
    const ctx = require.context('../../../../../scope', true, /[/\\]utils[/\\]serverStartActions\.js$/)
    const key = (ctx.keys() || []).find(k => /serverStartActions\.js$/.test(k))
    if (key) return ctx(key)
  } catch (e) { /* dashboard 无 GPU 扩展时忽略 */ }
  return null
}

const scopeStart = loadScopeStartModule()

function getDefaultStartAction (objList, obj, manager, isHostServer) {
  return {
    label: objList.$t('compute.text_272'),
    permission: 'server_perform_start',
    action: () => {
      manager('performAction', {
        steadyStatus: 'running',
        id: isHostServer ? obj.server_id : obj.id,
        managerArgs: {
          action: 'start',
        },
      })
    },
    meta: () => {
      return {
        validate: obj.status === 'ready' && !commonUnabled(obj),
      }
    },
    hidden: () => objList.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_start'),
  }
}

function getDefaultBatchStartAction (vm) {
  return {
    label: vm.$t('compute.text_272'),
    permission: 'server_perform_start',
    action: () => {
      const ids = vm.list.selectedItems.map(item => item.id)
      vm.onManager('batchPerformAction', {
        steadyStatus: 'running',
        id: ids,
        managerArgs: {
          action: 'start',
        },
      })
    },
    meta: () => {
      let ret = {
        validate: true,
        tooltip: null,
      }
      ret.validate = vm.list.selectedItems.length > 0
      if (!ret.validate) return ret
      ret = vm.$isValidateResourceLock(vm.list.selectedItems, () => {
        ret.validate = vm.list.selectedItems.every(item => item.status === 'ready')
        return ret
      })
      return ret
    },
    hidden: () => vm.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_start'),
  }
}

export function getStartAction (objList, obj, manager, isHostServer) {
  if (scopeStart && typeof scopeStart.getBaremetalStartAction === 'function') {
    try {
      const custom = scopeStart.getBaremetalStartAction(objList, obj, manager, isHostServer)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultStartAction(objList, obj, manager, isHostServer)
}

export function getBatchStartAction (vm) {
  if (scopeStart && typeof scopeStart.getBaremetalBatchStartAction === 'function') {
    try {
      const custom = scopeStart.getBaremetalBatchStartAction(vm)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultBatchStartAction(vm)
}

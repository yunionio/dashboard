/**
 * 开机操作桥接（Compute 同步目录）
 * 优先加载 scope/utils/serverStartActions.js；缺失则回退原开机逻辑
 */
import i18n from '@/locales'
import { cloudEnabled } from '../utils'

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
    label: i18n.t('compute.text_272'),
    permission: 'server_perform_start',
    action: () => {
      vm.createDialog('VmStartDialog', {
        data: [obj],
        columns: vm.columns,
        onManager: vm.onManager,
      })
    },
    meta: () => {
      return {
        validate: cloudEnabled('start', obj),
      }
    },
    hidden: () => vm.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start'),
  }
}

function getDefaultBatchStartAction (vm) {
  return {
    label: vm.$t('compute.text_272'),
    permission: 'server_perform_start',
    action: () => {
      vm.createDialog('VmStartDialog', {
        data: vm.list.selectedItems,
        columns: vm.columns,
        onManager: vm.onManager,
      })
    },
    meta: () => {
      let ret = {
        validate: true,
        tooltip: null,
      }
      ret.validate = vm.list.selectedItems.length > 0
      if (!ret.validate) return ret
      if (typeof vm.hasSomeCloud === 'function') {
        const unenableCloudCheck = vm.hasSomeCloud(vm.list.selectedItems)
        if (!unenableCloudCheck.validate) return unenableCloudCheck
      }
      ret = vm.$isValidateResourceLock(vm.list.selectedItems, () => {
        ret.validate = vm.list.selectedItems.every(item => item.status === 'ready')
        return ret
      })
      return ret
    },
    hidden: () => vm.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start'),
  }
}

export function getStartAction (vm, obj) {
  if (scopeStart && typeof scopeStart.getStartAction === 'function') {
    try {
      const custom = scopeStart.getStartAction(vm, obj)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultStartAction(vm, obj)
}

export function getBatchStartAction (vm) {
  if (scopeStart && typeof scopeStart.getBatchStartAction === 'function') {
    try {
      const custom = scopeStart.getBatchStartAction(vm)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultBatchStartAction(vm)
}

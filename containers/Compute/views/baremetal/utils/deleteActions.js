/**
 * 裸金属删除桥接（Compute 同步目录）
 * 优先加载 scope 自定义删除；缺失则回退原 DeleteResDialog 逻辑
 * 注意：不可静态 import @scope 下 GPU 专属文件，否则 dashboard 构建会报错
 */
import i18n from '@/locales'
import {
  baremetalDeleteBlockedTipWhenCannotDelete,
  baremetalDeleteRequestParams,
  baremetalsDeleteMeta,
  partitionBaremetalDeleteByOverride,
} from '../../../utils/ipmi'

function loadScopeDeleteModule () {
  try {
    const ctx = require.context('../../../../../scope', true, /[/\\]utils[/\\]serverDeleteActions\.js$/)
    const key = (ctx.keys() || []).find(k => /serverDeleteActions\.js$/.test(k))
    if (key) return ctx(key)
  } catch (e) { /* dashboard 无 GPU 扩展时忽略 */ }
  return null
}

const scopeDelete = loadScopeDeleteModule()

async function runBaremetalBatchDelete (vm, data) {
  const { withOverride, withoutOverride } = partitionBaremetalDeleteByOverride(data)
  if (withOverride.length) {
    await vm.onManager('batchDelete', {
      id: withOverride.map(item => item.id),
      managerArgs: { params: { override_pending_delete: true } },
    })
  }
  if (withoutOverride.length) {
    await vm.onManager('batchDelete', {
      id: withoutOverride.map(item => item.id),
      managerArgs: { params: {} },
    })
  }
}

function getDefaultDeleteAction (vm, obj) {
  return {
    label: i18n.t('compute.perform_delete'),
    permission: 'server_delete',
    action: () => {
      vm.createDialog('DeleteResDialog', {
        vm,
        data: [obj],
        columns: vm.columns,
        onManager: vm.onManager,
        title: i18n.t('compute.perform_delete'),
        requestParams: baremetalDeleteRequestParams([obj]),
        success: () => {
          vm.destroySidePages && vm.destroySidePages()
        },
      })
    },
    meta: () => {
      const ret = {
        validate: false,
        tooltip: null,
      }
      if (vm.isAdminMode && obj.billing_type === 'prepaid') {
        ret.tooltip = i18n.t('compute.text_285')
        return ret
      }
      if (!obj.can_delete) {
        return baremetalDeleteBlockedTipWhenCannotDelete(obj)
      }
      ret.validate = true
      return ret
    },
    hidden: () => vm.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_delete'),
  }
}

function getDefaultBatchDeleteAction (vm) {
  return {
    label: vm.$t('compute.perform_delete'),
    permission: 'server_delete',
    action: () => {
      const data = vm.list.selectedItems
      vm.createDialog('DeleteResDialog', {
        vm,
        data,
        columns: vm.columns,
        onManager: vm.onManager,
        title: vm.$t('compute.perform_delete'),
        ok: async () => {
          await runBaremetalBatchDelete(vm, data)
          vm.destroySidePages && vm.destroySidePages()
        },
      })
    },
    meta: () => {
      if (vm.list.selectedItems.some(item => item.billing_type === 'prepaid')) {
        return {
          validate: false,
          tooltip: vm.$t('compute.text_285'),
        }
      }
      return baremetalsDeleteMeta(vm.list.selectedItems)
    },
    hidden: () => vm.$isScopedPolicyMenuHidden('baremetal_hidden_menus.server_perform_delete'),
  }
}

export function getDeleteAction (vm, obj) {
  if (scopeDelete && typeof scopeDelete.getBaremetalDeleteAction === 'function') {
    try {
      const custom = scopeDelete.getBaremetalDeleteAction(vm, obj)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultDeleteAction(vm, obj)
}

export function getBatchDeleteAction (vm) {
  if (scopeDelete && typeof scopeDelete.getBaremetalBatchDeleteAction === 'function') {
    try {
      const custom = scopeDelete.getBaremetalBatchDeleteAction(vm)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultBatchDeleteAction(vm)
}

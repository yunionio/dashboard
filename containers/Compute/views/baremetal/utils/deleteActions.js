/**
 * 裸金属删除桥接（Compute 同步目录）
 * 优先加载 scope 自定义删除；缺失则回退原 DeleteResDialog 逻辑
 * 注意：不可静态 import @scope 下 GPU 专属文件，否则 dashboard 构建会报错
 */
import i18n from '@/locales'

function loadScopeDeleteModule () {
  try {
    const ctx = require.context('../../../../../scope', true, /[/\\]utils[/\\]serverDeleteActions\.js$/)
    const key = (ctx.keys() || []).find(k => /serverDeleteActions\.js$/.test(k))
    if (key) return ctx(key)
  } catch (e) { /* dashboard 无 GPU 扩展时忽略 */ }
  return null
}

const scopeDelete = loadScopeDeleteModule()

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
        ret.tooltip = i18n.t('compute.text_284')
        return ret
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
      vm.createDialog('DeleteResDialog', {
        vm,
        data: vm.list.selectedItems,
        columns: vm.columns,
        onManager: vm.onManager,
        title: vm.$t('compute.perform_delete'),
      })
    },
    meta: () => {
      // 与 dashboard 裸金属 List 批量删除原逻辑一致（注意：与单行不同，不判断 isAdminMode）
      const ret = {
        validate: true,
        tooltip: null,
      }
      if (vm.list.selectedItems.some(item => item.billing_type === 'prepaid')) {
        ret.validate = false
        ret.tooltip = vm.$t('compute.text_285')
        return ret
      }
      return vm.$getDeleteResult(vm.list.selectedItems)
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

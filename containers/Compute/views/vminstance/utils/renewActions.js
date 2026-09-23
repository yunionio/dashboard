/**
 * 续费操作桥接（位于 dashboard 同步目录 Compute 内）
 * - 优先尝试加载 GPU 专属 scope/utils/serverRenewActions.js
 * - 单行：有自定义则用自定义，否则回退原续费
 * - 批量：有自定义配置时由 scope 返回 hidden 项（原批量与自定义均不展示）；未配置则回退原批量续费
 * 注意：不可静态 import @scope 下 GPU 专属文件，否则 dashboard 构建会报错
 */
import i18n from '@/locales'
import { findPlatform } from '@/utils/common/hypervisor'
import { hasSetupKey } from '@/utils/auth'
import { SERVER_TYPE } from '@Compute/constants'
import { validateRescueMode } from '../utils'

function loadScopeRenewModule () {
  try {
    // 从项目根 scope 下按文件名匹配；dashboard 无此文件时 keys 为空
    const ctx = require.context('../../../../../scope', true, /[/\\]utils[/\\]serverRenewActions\.js$/)
    const key = (ctx.keys() || []).find(k => /serverRenewActions\.js$/.test(k))
    if (key) return ctx(key)
  } catch (e) { /* dashboard 无 GPU 扩展时忽略 */ }
  return null
}

const scopeRenew = loadScopeRenewModule()

function getDefaultRenewAction (vm, obj) {
  return {
    label: i18n.t('compute.text_1117'),
    permission: 'server_perform_renew',
    action: () => {
      vm.$openNewWindowForMenuHook('vminstance_configured_callback_address.renew_callback_address', () => {
        vm.createDialog('VmResourceFeeDialog', {
          data: [obj],
          columns: vm.columns,
          onManager: vm.onManager,
        })
      })
    },
    meta: () => {
      const ret = {
        validate: false,
        tooltip: null,
      }
      const rescueModeValid = validateRescueMode(obj)
      if (!rescueModeValid.validate) return rescueModeValid
      if (findPlatform(obj.hypervisor) !== SERVER_TYPE.public) {
        ret.tooltip = i18n.t('compute.text_1118')
        return ret
      }
      if (obj.billing_type !== 'prepaid') {
        ret.tooltip = i18n.t('compute.text_1119')
        return ret
      }
      ret.validate = true
      return ret
    },
    hidden: () => !(hasSetupKey(['aliyun', 'qcloud', 'huawei', 'ucloud', 'rockbase', 'ecloud', 'jdcloud'])) || vm.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_Renew'),
  }
}

function getDefaultBatchRenewAction (vm) {
  return {
    label: vm.$t('compute.text_1117'),
    permission: 'server_perform_renew',
    action: () => {
      vm.createDialog('VmResourceFeeDialog', {
        data: vm.list.selectedItems,
        columns: vm.columns,
        onManager: vm.onManager,
      })
    },
    meta: () => {
      const ret = {
        validate: true,
        tooltip: null,
      }
      const rescueModeValid = validateRescueMode(vm.list.selectedItems)
      if (!rescueModeValid.validate) return rescueModeValid
      const isAllPublic = vm.list.selectedItems.every(item => findPlatform(item.hypervisor) === SERVER_TYPE.public)
      const isAllPrepaid = vm.list.selectedItems.every(item => item.billing_type === 'prepaid')
      if (!isAllPublic) {
        ret.validate = false
        ret.tooltip = vm.$t('compute.text_1118')
      }
      if (!isAllPrepaid) {
        ret.validate = false
        ret.tooltip = vm.$t('compute.text_1119')
      }
      return ret
    },
    hidden: () => !hasSetupKey(['aliyun', 'qcloud', 'huawei', 'ucloud', 'rockbase', 'ecloud', 'jdcloud', 'ctyun']) || vm.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_Renew'),
  }
}

export function getRenewAction (vm, obj) {
  if (scopeRenew && typeof scopeRenew.getRenewAction === 'function') {
    try {
      const custom = scopeRenew.getRenewAction(vm, obj)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultRenewAction(vm, obj)
}

export function getBatchRenewAction (vm) {
  if (scopeRenew && typeof scopeRenew.getBatchRenewAction === 'function') {
    try {
      const custom = scopeRenew.getBatchRenewAction(vm)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultBatchRenewAction(vm)
}

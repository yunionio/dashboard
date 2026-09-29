/**
 * 自动续费操作桥接（位于 Compute 同步目录）
 * - 优先加载 GPU scope/utils/serverAutoRenewActions.js
 * - 单行/批量：有自定义则用自定义，否则回退原自动续费（公有云）
 * 注意：不可静态 import @scope 下 GPU 专属文件，否则 dashboard 构建会报错
 */
import i18n from '@/locales'
import { findPlatform } from '@/utils/common/hypervisor'
import { hasSetupKey } from '@/utils/auth'
import { SERVER_TYPE } from '@Compute/constants'
import { validateRescueMode } from '../utils'

function loadScopeAutoRenewModule () {
  try {
    const ctx = require.context('../../../../../scope', true, /[/\\]utils[/\\]serverAutoRenewActions\.js$/)
    const key = (ctx.keys() || []).find(k => /serverAutoRenewActions\.js$/.test(k))
    if (key) return ctx(key)
  } catch (e) { /* dashboard 无 GPU 扩展时忽略 */ }
  return null
}

const scopeAutoRenew = loadScopeAutoRenewModule()

function getDefaultAutoRenewAction (vm, obj) {
  return {
    label: i18n.t('compute.text_1120'),
    permission: 'server_perform_aet_auto_renew',
    action: () => {
      vm.createDialog('VmResourceRenewFeeDialog', {
        data: [obj],
        columns: vm.columns,
        onManager: vm.onManager,
        refresh: vm.refresh,
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
    hidden: () => !(hasSetupKey(['aliyun', 'qcloud', 'huawei', 'ucloud', 'rockbase', 'ecloud', 'jdcloud', 'ctyun'])) || vm.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_auto_renewal'),
  }
}

function getDefaultBatchAutoRenewAction (vm) {
  return {
    label: vm.$t('compute.text_1120'),
    permission: 'server_perform_aet_auto_renew',
    action: () => {
      vm.createDialog('VmResourceRenewFeeDialog', {
        data: vm.list.selectedItems,
        columns: vm.columns,
        onManager: vm.onManager,
        refresh: vm.refresh,
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
    hidden: () => !(hasSetupKey(['aliyun', 'qcloud', 'huawei', 'ucloud', 'rockbase', 'ecloud', 'jdcloud', 'ctyun'])) || vm.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_auto_renewal'),
  }
}

export function getAutoRenewAction (vm, obj) {
  if (scopeAutoRenew && typeof scopeAutoRenew.getAutoRenewAction === 'function') {
    try {
      const custom = scopeAutoRenew.getAutoRenewAction(vm, obj)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultAutoRenewAction(vm, obj)
}

export function getBatchAutoRenewAction (vm) {
  if (scopeAutoRenew && typeof scopeAutoRenew.getBatchAutoRenewAction === 'function') {
    try {
      const custom = scopeAutoRenew.getBatchAutoRenewAction(vm)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getDefaultBatchAutoRenewAction(vm)
}

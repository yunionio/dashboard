/**
 * 裸金属续费桥接
 * 原先无续费：有自定义配置则展示自定义；未配置则隐藏占位（不展示）
 */
function loadScopeRenewModule () {
  try {
    const ctx = require.context('../../../../../scope', true, /[/\\]utils[/\\]serverRenewActions\.js$/)
    const key = (ctx.keys() || []).find(k => /serverRenewActions\.js$/.test(k))
    if (key) return ctx(key)
  } catch (e) { /* dashboard 无 GPU 扩展时忽略 */ }
  return null
}

const scopeRenew = loadScopeRenewModule()

function getHiddenPlaceholder (vm) {
  return {
    label: vm.$t('compute.text_1117'),
    permission: 'server_perform_renew',
    action: () => {},
    meta: () => ({ validate: false, tooltip: null }),
    hidden: () => true,
  }
}

export function getRenewAction (vm, obj) {
  if (scopeRenew && typeof scopeRenew.getBaremetalRenewAction === 'function') {
    try {
      const custom = scopeRenew.getBaremetalRenewAction(vm, obj)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getHiddenPlaceholder(vm)
}

export function getBatchRenewAction (vm) {
  if (scopeRenew && typeof scopeRenew.getBaremetalBatchRenewAction === 'function') {
    try {
      const custom = scopeRenew.getBaremetalBatchRenewAction(vm)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getHiddenPlaceholder(vm)
}

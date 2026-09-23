/**
 * 容器主机续费桥接
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
  if (scopeRenew && typeof scopeRenew.getContainerRenewAction === 'function') {
    try {
      const custom = scopeRenew.getContainerRenewAction(vm, obj)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getHiddenPlaceholder(vm)
}

export function getBatchRenewAction (vm) {
  if (scopeRenew && typeof scopeRenew.getContainerBatchRenewAction === 'function') {
    try {
      const custom = scopeRenew.getContainerBatchRenewAction(vm)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getHiddenPlaceholder(vm)
}

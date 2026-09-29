/**
 * 容器主机自动续费桥接
 * 原先无自动续费：有自定义配置则展示自定义；未配置则隐藏占位
 */
function loadScopeAutoRenewModule () {
  try {
    const ctx = require.context('../../../../../scope', true, /[/\\]utils[/\\]serverAutoRenewActions\.js$/)
    const key = (ctx.keys() || []).find(k => /serverAutoRenewActions\.js$/.test(k))
    if (key) return ctx(key)
  } catch (e) { /* ignore */ }
  return null
}

const scopeAutoRenew = loadScopeAutoRenewModule()

function getHiddenPlaceholder (vm) {
  return {
    label: vm.$t('compute.text_1120'),
    permission: 'server_perform_aet_auto_renew',
    action: () => {},
    meta: () => ({ validate: false, tooltip: null }),
    hidden: () => true,
  }
}

export function getAutoRenewAction (vm, obj) {
  if (scopeAutoRenew && typeof scopeAutoRenew.getContainerAutoRenewAction === 'function') {
    try {
      const custom = scopeAutoRenew.getContainerAutoRenewAction(vm, obj)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getHiddenPlaceholder(vm)
}

export function getBatchAutoRenewAction (vm) {
  if (scopeAutoRenew && typeof scopeAutoRenew.getContainerBatchAutoRenewAction === 'function') {
    try {
      const custom = scopeAutoRenew.getContainerBatchAutoRenewAction(vm)
      if (custom) return custom
    } catch (e) { /* fallback */ }
  }
  return getHiddenPlaceholder(vm)
}

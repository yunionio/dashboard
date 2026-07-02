export const PROVIDER_TYPE_BUILTIN = 'builtin'
export const PROVIDER_TYPE_CUSTOM = 'custom'
export const CUSTOM_PROVIDER_KEY = 'custom'

/** @param {string} key */
export function isCustomProviderKey (key) {
  return String(key || '').trim().toLowerCase() === CUSTOM_PROVIDER_KEY
}

/** @param {import('vue').default} vm */
export function getProviderTypeOptions (vm) {
  return [
    { value: PROVIDER_TYPE_BUILTIN, label: vm.$t('aice.aiproxy.provider_type.builtin') },
    { value: PROVIDER_TYPE_CUSTOM, label: vm.$t('aice.aiproxy.provider_type.custom') },
  ]
}

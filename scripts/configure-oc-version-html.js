function isTruthy (v) {
  return ['true', '1', 'yes'].includes(String(v || '').trim().toLowerCase())
}

/**
 * 向 index.html 注入 window.__OC_VERSION_REDIRECT_ENABLED__ / __OC_LEGACY_APP_URL__
 */
function configureOcVersionHtml (config) {
  config.plugin('html').tap((args) => {
    const isProd = process.env.NODE_ENV === 'production'
    const redirectEnabled = isProd || isTruthy(process.env.VUE_APP_OC_VERSION_REDIRECT_IN_DEV)
    const legacyUrl = process.env.VUE_APP_LEGACY_APP_URL || ''
    const prev = args[0].templateParameters
    args[0].templateParameters = (...params) => {
      const baseParams = typeof prev === 'function' ? prev(...params) : {}
      return {
        ...baseParams,
        ocVersionRedirectEnabled: redirectEnabled,
        ocLegacyAppUrl: legacyUrl,
      }
    }
    return args
  })
}

module.exports = { configureOcVersionHtml }

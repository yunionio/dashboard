import i18n from '@/locales'
import { FORECAST_FILTERS_MAP } from '@Compute/constants'

function asArray (value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

/**
 * POST /llm_skus/{id}/schedulable-check
 */
export function checkSkuSchedulable (manager, skuId) {
  return manager.performAction({
    id: skuId,
    action: 'schedulable-check',
    data: {},
  })
}

/**
 * Map schedulable-check / forecast payload into SideErrors shape.
 */
export function getSchedulableCheckErrors (data = {}) {
  const candidates = asArray(data.filtered_candidates)
  const errors = []
  if (candidates.length > 0) {
    candidates.forEach((item) => {
      const hostName = item.name || item.host_name || item.id || ''
      let message = hostName
        ? `${i18n.t('dictionary.host')}【${hostName}】`
        : ''
      const filterMapItem = FORECAST_FILTERS_MAP[item.filter_name]
      if (filterMapItem) {
        message += filterMapItem
      } else if (item.filter_name) {
        message += i18n.t('compute.text_1325', [item.filter_name])
      } else if (!message) {
        message = data.reason || i18n.t('aice.llm_deployment.create.schedulable_check.failed')
      }
      errors.push({
        message,
        children: asArray(item.reasons),
      })
    })
  } else {
    errors.push({
      message: data.reason || i18n.t('aice.llm_deployment.create.schedulable_check.failed'),
    })
  }
  const notAllowReasons = asArray(data.not_allow_reasons)
  if (!notAllowReasons.length && data.reason) {
    notAllowReasons.push(data.reason)
  }
  return {
    errors,
    allow_count: data.allow_count || data.qualified_hosts || 0,
    req_count: data.req_count || 1,
    not_allow_reasons: notAllowReasons,
  }
}

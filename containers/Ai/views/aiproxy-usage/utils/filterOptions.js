import { getCustomDistinctFieldFilter } from '@/utils/common/tableFilter'
import { USAGE_RANGE_OPTIONS, USAGE_RESULT_OPTIONS } from '../constants'

export const USAGE_DISTINCT_FILTER_KEYS = ['api_key_label', 'model', 'provider', 'source']

export function fetchUsageDistinctField (item, { store, fetchMethod }) {
  if (!item.fetchMethod && !fetchMethod) return Promise.resolve([])
  const params = {
    scope: store.getters.scope,
    [item.distinctField.type]: item.distinctField.key,
  }
  const request = item.fetchMethod || fetchMethod
  return request(params).then(response => {
    const values = response.data[item.distinctField.key] || []
    let options = values.map(val => ({ label: val, key: val }))
    if (item.mapper) {
      options = item.mapper(options, response.data)
    }
    return options
  }).catch(() => [])
}

export function buildUsageSearchFilterOptions ({
  t,
  fetchEventsDistinctField,
  includeEventsFilters = false,
}) {
  const options = {
    range: {
      label: t('aice.aiproxy.usage.range'),
      dropdown: true,
      items: USAGE_RANGE_OPTIONS.map(item => ({
        key: item.value,
        label: item.label,
      })),
    },
    api_key_label: getCustomDistinctFieldFilter({
      label: t('aice.aiproxy.usage.api_key'),
      field: 'api_key_label',
      multiple: false,
      fetchMethod: params => fetchEventsDistinctField(params),
    }),
    model: getCustomDistinctFieldFilter({
      label: t('aice.aiproxy.usage.model'),
      field: 'model',
      multiple: false,
      fetchMethod: params => fetchEventsDistinctField(params),
    }),
    provider: getCustomDistinctFieldFilter({
      label: t('aice.aiproxy.usage.provider'),
      field: 'provider',
      multiple: false,
      fetchMethod: params => fetchEventsDistinctField(params),
    }),
    source: getCustomDistinctFieldFilter({
      label: t('aice.aiproxy.usage.source'),
      field: 'source',
      multiple: false,
      fetchMethod: params => fetchEventsDistinctField(params),
    }),
    result: {
      label: t('aice.aiproxy.usage.result'),
      dropdown: true,
      items: USAGE_RESULT_OPTIONS.filter(item => item.value).map(item => ({
        key: item.value,
        label: item.label,
      })),
    },
  }
  if (includeEventsFilters) {
    Object.assign(options, {
      id: {
        label: 'ID',
      },
      // status_code: {
      //   label: t('aice.aiproxy.usage.status_code'),
      //   filter: true,
      //   formatter: val => `status_code.equals(${val})`,
      // },
      // error_message: {
      //   label: t('aice.aiproxy.usage.error'),
      //   filter: true,
      //   formatter: val => `error_message.contains('${val}')`,
      // },
    })
  }
  return options
}

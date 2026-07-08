import i18n from '@/locales'

export const EVENTS_ONLY_FILTER_KEYS = ['id', 'status_code', 'error_message']

export const USAGE_RANGE_OPTIONS = [
  { value: '4h', label: i18n.t('aice.aiproxy.usage.range_4h') },
  { value: '8h', label: i18n.t('aice.aiproxy.usage.range_8h') },
  { value: '12h', label: i18n.t('aice.aiproxy.usage.range_12h') },
  { value: '24h', label: i18n.t('aice.aiproxy.usage.range_24h') },
  { value: 'today', label: i18n.t('aice.aiproxy.usage.range_today') },
  { value: 'yesterday', label: i18n.t('aice.aiproxy.usage.range_yesterday') },
  { value: '7d', label: i18n.t('aice.aiproxy.usage.range_7d') },
  { value: '30d', label: i18n.t('aice.aiproxy.usage.range_30d') },
  // { value: 'custom', label: i18n.t('aice.aiproxy.usage.range_custom') },
]

export const USAGE_RESULT_OPTIONS = [
  { value: '', label: i18n.t('aice.aiproxy.usage.result_all') },
  { value: 'success', label: i18n.t('aice.aiproxy.usage.result_success') },
  { value: 'failed', label: i18n.t('aice.aiproxy.usage.result_failed') },
]

export const DEFAULT_USAGE_RANGE = '24h'
export const DEFAULT_EVENTS_PAGE_SIZE = 50
export const EVENTS_PAGE_SIZES = [20, 50, 100]

export function buildDefaultFilters () {
  return {
    range: DEFAULT_USAGE_RANGE,
    start: '',
    end: '',
    timezone: '',
    api_key_label: '',
    model: '',
    provider: '',
    source: '',
    result: '',
    id: '',
    status_code: '',
    error_message: '',
  }
}

export function buildUsageQueryParams (filters, extra = {}) {
  const params = { ...extra }
  if (filters.range) params.range = filters.range
  if (filters.range === 'custom') {
    if (filters.start) params.start = filters.start
    if (filters.end) params.end = filters.end
  }
  if (filters.timezone) params.timezone = filters.timezone
  if (filters.api_key_label) params.api_key_label = filters.api_key_label
  if (filters.model) params.model = filters.model
  if (filters.provider) params.provider = filters.provider
  if (filters.source) params.source = filters.source
  if (filters.result) params.result = filters.result
  return params
}

export function formatApiKeyLabel (option) {
  if (!option) return ''
  return option.label || option.display_key || option.id || option.value || option.name || ''
}

function pickSearchValue (searchValue, key) {
  const val = searchValue[key]
  if (val == null || val.length === 0) return ''
  return Array.isArray(val) ? val.join('|') : String(val)
}

export function usageFiltersToSearchValue (filters, { includeEventsFields = true } = {}) {
  const value = {}
  const push = (key, val) => {
    if (val != null && val !== '') value[key] = Array.isArray(val) ? val : [String(val)]
  }
  push('range', filters.range || DEFAULT_USAGE_RANGE)
  push('api_key_label', filters.api_key_label)
  push('model', filters.model)
  push('provider', filters.provider)
  push('source', filters.source)
  push('result', filters.result)
  if (includeEventsFields) {
    push('id', filters.id)
    push('status_code', filters.status_code)
    push('error_message', filters.error_message)
  }
  return value
}

export function searchValueToUsageFilters (searchValue, { preserveFilters = {} } = {}) {
  const filters = {
    range: pickSearchValue(searchValue, 'range') || DEFAULT_USAGE_RANGE,
    start: '',
    end: '',
    timezone: '',
    api_key_label: pickSearchValue(searchValue, 'api_key_label'),
    model: pickSearchValue(searchValue, 'model'),
    provider: pickSearchValue(searchValue, 'provider'),
    source: pickSearchValue(searchValue, 'source'),
    result: pickSearchValue(searchValue, 'result'),
    id: pickSearchValue(searchValue, 'id'),
    status_code: pickSearchValue(searchValue, 'status_code'),
    error_message: pickSearchValue(searchValue, 'error_message'),
  }
  EVENTS_ONLY_FILTER_KEYS.forEach(key => {
    if (!searchValue[key]?.length && preserveFilters[key]) {
      filters[key] = preserveFilters[key]
    }
  })
  return filters
}

import _ from 'lodash'

export const CHART_TYPE_LINE = 'line'
export const CHART_TYPE_HEATMAP = 'heatmap'
export const DEFAULT_PERCENT_CHART_TYPES = [CHART_TYPE_LINE, CHART_TYPE_HEATMAP]
export const DEFAULT_CHART_TYPES = [CHART_TYPE_LINE]

const MESSAGE_KEY = 'chart_types'

/**
 * 是否为百分比指标（图表形式配置仅对 % 展示）
 */
export function isPercentUnit (unit) {
  return unit === '%' || unit === '100%'
}

/**
 * 从 panel 读取后端已存储的图表形式，未配置返回 null
 */
export function getStoredChartTypes (panel) {
  if (!panel) return null
  const fromSetting = _.get(panel, 'setting.chart_types') || _.get(panel, 'settings.chart_types')
  if (Array.isArray(fromSetting) && fromSetting.length) {
    return [...fromSetting]
  }
  const message = panel.message
  if (message && typeof message === 'string' && message.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(message)
      if (Array.isArray(parsed[MESSAGE_KEY]) && parsed[MESSAGE_KEY].length) {
        return [...parsed[MESSAGE_KEY]]
      }
    } catch (e) { /* ignore */ }
  }
  return null
}

/**
 * 解析图表形式
 * - 监控查询（queryOnly）：未配置时，百分比默认折线+热力图
 * - 监控面板（已落库）：有配置用配置，没有则仅折线
 * - 新建面板（尚未落库）：百分比默认折线+热力图，便于配置后保存
 */
export function parseChartTypesFromPanel (panel, { isPercent = false, queryOnly = false } = {}) {
  const stored = getStoredChartTypes(panel)
  if (stored) return stored

  // 监控查询：未持久化配置，百分比默认双图
  if (queryOnly) {
    return isPercent ? [...DEFAULT_PERCENT_CHART_TYPES] : [...DEFAULT_CHART_TYPES]
  }

  // 已落库面板（id / panel_id）但未配置：旧数据，仅折线
  if (panel && (panel.id || panel.panel_id)) {
    return [...DEFAULT_CHART_TYPES]
  }

  // 新建面板（尚未落库）：百分比默认双图
  return isPercent ? [...DEFAULT_PERCENT_CHART_TYPES] : [...DEFAULT_CHART_TYPES]
}

/**
 * 写入 alertpanel.message 的图表配置 JSON
 */
export function buildChartTypesMessage (chartTypes) {
  return JSON.stringify({ [MESSAGE_KEY]: chartTypes || [...DEFAULT_PERCENT_CHART_TYPES] })
}

export function getMetricUnit (mertricItem) {
  return _.get(mertricItem, 'description.unit') || _.get(mertricItem, 'unit') || ''
}

// import { tableColumnMaps } from '@Monitor/constants'

export const getChartTooltipLabel = (serieItem, gorupBy, measurement) => {
  const { raw_name = '', tags = {} } = serieItem
  if (raw_name && raw_name !== 'unknown-0-value') {
    // 从raw_name解析
    if (raw_name.startsWith('{') && raw_name.endsWith('}')) {
      try {
        const str = raw_name.substring(1, raw_name.length - 1)
        const list = str.split(',')
        const ret = []
        list.forEach(item => {
          const [key, value] = item.split('=')
          ret.push({ key: key, label: `${key}=${value}` })
        })
        return ret.map(item => item.label).join(',')
      } catch (err) { }
    } else {
      return raw_name
    }
  }
  const keys = Object.keys(tags)
  if (keys.length) {
    const ret = keys.map(key => ({ key, label: `${key}=${tags[key]}` }))
    return ret.map(item => item.label).join(',')
  }
  return '-'
}

// 可作为资源展示名的标签，按优先级排列
export const SERIES_NAME_TAGS = [
  'vm_name', 'name', 'oss_name', 'redis_name', 'rds_name', 'storage_name',
  'host', 'hostname',
]

/** 判断聚合字段值是否是无意义的 ID */
const isIdValue = (field, value) => {
  if (!value) return true
  if (/(^|_)id$/.test(field || '')) return true
  return /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(value))
}

const pickReadableTag = (tags = {}) => {
  const key = SERIES_NAME_TAGS.find(k => tags[k])
  return key ? String(tags[key]) : ''
}

const parseRawName = (rawName) => {
  if (!rawName || rawName === 'unknown-0-value' || String(rawName).startsWith('{')) return ''
  return String(rawName).replace(/^unknown-0-/, '')
}

/**
 * 单条 series 的展示名，图表 tooltip、热力图行名、表格与导出统一使用
 * 优先级：聚合字段值 > 资源名类标签 > raw_name > 原始标签串
 */
export const getSeriesDisplayName = (item = {}, groupBy) => {
  const tags = item.tags || {}
  const fields = (groupBy || []).map(g => g && g.params && g.params[0]).filter(Boolean)
  if (fields.length) {
    const parts = []
    fields.forEach(field => {
      const value = tags[field]
      if (!value) return
      // 聚合字段是 ID 时，用资源可读名替代，避免展示 UUID
      const name = isIdValue(field, value) ? pickReadableTag(tags) : String(value)
      if (name && !parts.includes(name)) parts.push(name)
    })
    if (parts.length) return parts.join(' / ')
  }
  return pickReadableTag(tags) ||
    parseRawName(item.raw_name) ||
    getChartTooltipLabel(item, groupBy) ||
    ''
}

/**
 * 批量生成展示名，并对同名系列追加区分信息（品牌 / 区域或序号），保证图表与导出可区分
 */
export const buildSeriesDisplayNames = (series = [], groupBy) => {
  const used = {}
  return series.map((item, index) => {
    const name = getSeriesDisplayName(item, groupBy) || `series-${index + 1}`
    if (!used[name]) {
      used[name] = 1
      return name
    }
    used[name] += 1
    const tags = item.tags || {}
    const extra = [tags.brand, tags.cloudregion].filter(Boolean).join(' / ')
    const next = extra ? `${name} (${extra})` : `${name} #${used[name]}`
    used[next] = 1
    return next
  })
}

/**
 * 生成监控面板名称：label 已包含指标（如「可用内存率(agent_mem.available_percent)」）时不再重复拼接
 * @param {String} label 面板名称
 * @param {String} metric 指标，格式为 measurement.field
 * @param {String} measurement 测量项
 * @param {String} field 字段
 */
export const buildPanelName = (label, metric, measurement, field) => {
  const base = label || ''
  const target = metric || (measurement && field ? `${measurement}.${field}` : '')
  if (!target) return base
  return base.includes(target) ? base : `${base}(${target})`
}

// 添加缺失的时间点
export const addMissingSeries = (series = [], chartQueryData, moment) => {
  if (series.length && series.some(item => item.points && item.points.length)) {
    return series.map(item => {
      const idx = (series[0].columns || []).findIndex(c => c === 'time')
      if (idx === -1) return item
      const points = item.points || []
      if (points.length === 0) return item
      const point = points[0]
      const pointFrom = point[idx]
      const pointTo = item.points[item.points.length - 1][idx]
      let { from, to, interval } = chartQueryData
      if (interval.includes('h')) {
        interval = parseInt(interval.replace('h', '')) * 60 * 60 * 1000
      } else if (interval.includes('m')) {
        interval = parseInt(interval.replace('m', '')) * 60 * 1000
      } else if (interval.includes('s')) {
        interval = parseInt(interval.replace('s', '')) * 1000
      } else {
        interval = parseInt(interval)
      }
      if (from && to && /^\d+$/.test(from + '') && /^\d+$/.test(to + '')) {
      } else if (from && (!to || to === 'now') && /^\d+[h]$/.test(from + '')) {
        to = moment.valueOf()
        from = moment.clone().subtract(parseInt(from.replace('h', '')), 'hours').valueOf()
      } else if (from && to && /^\d+[h]$/.test(from + '') && /^\d+[h]$/.test(to + '')) {
        // 使用 clone() 创建副本，避免修改原始 moment 对象
        // 先计算 from，再计算 to（因为 to 应该比 from 更晚）
        from = moment.clone().subtract(parseInt(from.replace('h', '')), 'hours').valueOf()
        to = moment.clone().subtract(parseInt(to.replace('h', '')), 'hours').valueOf()
      } else {
        // 未正确解析，不处理
        return item
      }
      let lastFrom = pointFrom
      let lastTo = pointTo
      if (points[1] && points[1][idx] - points[0][idx] === interval * 2) {
        interval = interval * 2
      }
      for (let i = pointFrom; i > from; i -= interval) {
        lastFrom = i
        if (lastFrom < from) {
          break
        }
      }
      for (let i = pointTo; i < to; i += interval) {
        lastTo = i
        if (lastTo > to) {
          break
        }
      }
      const list = []
      for (let i = lastFrom; i <= lastTo; i += interval) {
        const target = points.findIndex(p => p[idx] === i)
        if (target === -1) {
          const item = Array.from({ length: point.length }, () => null)
          item[idx] = i
          list.push(item)
        } else {
          list.push(points[target])
        }
      }
      list.sort((a, b) => a[idx] - b[idx])
      item.points = list
      return item
    })
  }
  return series
}

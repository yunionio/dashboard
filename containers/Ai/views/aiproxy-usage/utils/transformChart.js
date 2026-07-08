import moment from 'moment'

function formatTimestamp (timestamp, fmt) {
  if (!timestamp) return ''
  const m = moment(timestamp)
  if (!m.isValid()) return timestamp
  return m.format(fmt || 'MM/DD HH:mm')
}

export function seriesToLineChart (series, config) {
  const timeLabel = config.timeLabel || 'time'
  const rows = (series || []).map(point => {
    const row = { [timeLabel]: formatTimestamp(point.timestamp, config.timeFormat) }
    ;(config.fields || []).forEach(field => {
      row[field.label] = point[field.key] ?? 0
    })
    return row
  })
  const columns = [timeLabel, ...(config.fields || []).map(field => field.label)]
  return { columns, rows }
}

export function compositionToRingChart (items, options = {}) {
  const nameKey = options.nameKey || 'name'
  const valueKey = options.valueKey || 'request_count'
  const sourceItems = items || []
  const rows = sourceItems
    .filter(item => (item[valueKey] ?? 0) > 0)
    .map(item => ({
      name: item[nameKey] || item.label || item.id || '-',
      count: item[valueKey] ?? 0,
    }))
  if (!rows.length) {
    rows.push({ name: '-', count: 0 })
  }
  const total = rows.reduce((sum, row) => sum + row.count, 0)
  let subtitle = String(total)
  if (valueKey === 'success_rate') {
    const weight = sourceItems.reduce((sum, item) => sum + (item.request_count || 0), 0)
    const weightedRate = weight
      ? sourceItems.reduce((sum, item) => sum + (item.success_rate || 0) * (item.request_count || 0), 0) / weight
      : 0
    subtitle = `${(weightedRate * 100).toFixed(1)}%`
  } else if (valueKey === 'total_cost') {
    subtitle = total.toFixed(4)
  }
  return {
    chartData: {
      columns: ['name', 'count'],
      rows,
    },
    subtitle,
  }
}

export function buildLocalHeatmapMatrix (points, valueKey = 'request_count') {
  const WEEKDAY_OFFSET = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  }
  const MOMENT_DAY_TO_WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const utcBaseMonday = moment.utc('2024-01-01T00:00:00')
  const matrix = {}
  let maxVal = 0

  ;(points || []).forEach(point => {
    const offset = WEEKDAY_OFFSET[point.weekday]
    if (offset == null) return

    const utc = utcBaseMonday.clone().add(offset, 'days').hour(Number(point.hour)).minute(0).second(0).millisecond(0)
    const local = utc.local()
    const localDay = MOMENT_DAY_TO_WEEKDAY[local.day()]
    const localHour = local.hour()
    const val = point[valueKey] || 0

    if (!matrix[localDay]) matrix[localDay] = {}
    matrix[localDay][localHour] = (matrix[localDay][localHour] || 0) + val
    maxVal = Math.max(maxVal, matrix[localDay][localHour])
  })

  return { matrix, maxVal: maxVal || 1 }
}

export function buildHeatmapMatrix (points, valueKey = 'request_count') {
  const { matrix, maxVal } = buildLocalHeatmapMatrix(points, valueKey)
  return {
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    matrix,
    maxCount: maxVal,
  }
}

import moment from 'moment'

const HOUR_MS = 60 * 60 * 1000

function toHourStartMs (input) {
  return moment(input).startOf('hour').valueOf()
}

/**
 * 将用量 series 转为 uPlot 数据：
 * - 横轴按「整点小时」补齐（每个点对应一个小时整点）
 * - 无数据的小时填 null（折线不画该点）
 */
export function seriesToUPlotHourly (series, config = {}) {
  const fields = config.fields || []
  const colors = config.colors || ['#ADD1F3', '#F3CBAD', '#F3ADB2', '#ADE4B6', '#ADAEF3', '#A593E0']
  const points = series || []

  let startMs
  let endMs
  if (config.start && config.end) {
    startMs = moment(config.start).valueOf()
    endMs = moment(config.end).valueOf()
  } else if (points.length) {
    const times = points.map(p => moment(p.timestamp).valueOf()).filter(t => !Number.isNaN(t))
    startMs = Math.min.apply(null, times)
    endMs = Math.max.apply(null, times)
  } else {
    return { data: [], seriesMeta: [] }
  }

  if (!startMs || !endMs || Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return { data: [], seriesMeta: [] }
  }

  // 对齐到整点小时
  startMs = toHourStartMs(startMs)
  endMs = toHourStartMs(endMs)
  if (endMs < startMs) {
    return { data: [], seriesMeta: [] }
  }

  // 每个整点一个横轴点（秒级时间戳，且保证是整点）
  const timesSec = []
  for (let t = startMs; t <= endMs; t += HOUR_MS) {
    timesSec.push(Math.floor(t / 1000))
  }

  // 业务数据按整点小时归桶（同一小时多条取最后一条）
  const byHour = {}
  points.forEach(point => {
    const hourMs = toHourStartMs(point.timestamp)
    if (Number.isNaN(hourMs)) return
    byHour[hourMs] = point
  })

  const data = [timesSec]
  const seriesMeta = fields.map((field, idx) => {
    const row = timesSec.map(sec => {
      const point = byHour[sec * 1000]
      if (!point) return null
      const val = point[field.key]
      if (val == null || val === '') return null
      const num = Number(val)
      return Number.isNaN(num) ? null : num
    })
    data.push(row)
    return {
      label: field.label,
      stroke: colors[idx % colors.length],
    }
  })

  return { data, seriesMeta }
}

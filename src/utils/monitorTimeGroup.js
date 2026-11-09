import i18n from '@/locales'

/** 自定义时间下取值间隔对应数据点数目标范围 */
export const MONITOR_TIME_GROUP_MIN_POINTS = 10
export const MONITOR_TIME_GROUP_MAX_POINTS = 144
const TARGET_POINTS = 30
const MIN_OPT_COUNT = 2
const MAX_OPT_COUNT = 5

/** 可选「好看」间隔白名单（分钟） */
const TIME_GROUP_CANDIDATES = [
  { key: '1m', minutes: 1 },
  { key: '5m', minutes: 5 },
  { key: '10m', minutes: 10 },
  { key: '15m', minutes: 15 },
  { key: '30m', minutes: 30 },
  { key: '1h', minutes: 60 },
  { key: '2h', minutes: 120 },
  { key: '3h', minutes: 180 },
  { key: '6h', minutes: 360 },
  { key: '12h', minutes: 720 },
  { key: '24h', minutes: 24 * 60 },
  { key: '7d', minutes: 7 * 24 * 60 },
  { key: '15d', minutes: 15 * 24 * 60 },
  { key: '30d', minutes: 30 * 24 * 60 },
]

export function parseMonitorIntervalToMinutes (key) {
  const s = String(key || '').trim()
  const m = s.match(/^(\d+)(m|h|d)$/i)
  if (!m) return 0
  const num = Number(m[1])
  const unit = m[2].toLowerCase()
  if (unit === 'm') return num
  if (unit === 'h') return num * 60
  if (unit === 'd') return num * 24 * 60
  return 0
}

export function parseMonitorIntervalToMs (key) {
  return parseMonitorIntervalToMinutes(key) * 60 * 1000
}

export function formatMonitorTimeGroupLabel (key) {
  const s = String(key || '').trim()
  const m = s.match(/^(\d+)(m|h|d)$/i)
  if (!m) return s
  const num = Number(m[1])
  const unit = m[2].toLowerCase()
  if (unit === 'm') {
    const dKey = `durations.${num}m`
    if (i18n.te(dKey)) return i18n.t(dKey)
    return i18n.t('common_num_minutes', [num])
  }
  if (unit === 'h') {
    const dKey = `durations.${num}h`
    if (i18n.te(dKey)) return i18n.t(dKey)
    return i18n.t('common_num_hours', [num])
  }
  if (num === 7) return i18n.t('durations.1w')
  if (num === 1) return i18n.t('durations.1d')
  return `${num}${i18n.t('subDurations.days')}`
}

function dataPointCount (durationMinutes, intervalMinutes) {
  return Math.floor(durationMinutes / intervalMinutes)
}

function scorePoints (points, strict) {
  if (strict) {
    if (points < MONITOR_TIME_GROUP_MIN_POINTS || points > MONITOR_TIME_GROUP_MAX_POINTS) return null
    return 0
  }
  if (points < 1) return null
  if (points < MONITOR_TIME_GROUP_MIN_POINTS) return MONITOR_TIME_GROUP_MIN_POINTS - points
  if (points > MONITOR_TIME_GROUP_MAX_POINTS) return points - MONITOR_TIME_GROUP_MAX_POINTS
  return 0
}

function makeItem (c, durationMinutes, strict) {
  if (c.minutes > durationMinutes) return null
  const points = dataPointCount(durationMinutes, c.minutes)
  const score = scorePoints(points, strict)
  if (score === null) return null
  return {
    key: c.key,
    label: formatMonitorTimeGroupLabel(c.key),
    minutes: c.minutes,
    points,
    score,
  }
}

/** 时长越长、合法项越多，待选越多（2～5 组） */
function desiredOptCount (validCount, durationMinutes) {
  if (validCount <= MIN_OPT_COUNT) return Math.min(validCount, MIN_OPT_COUNT)
  const hours = durationMinutes / 60
  let target = MIN_OPT_COUNT
  if (hours >= 1) target = 3
  if (hours >= 12) target = 4
  if (hours >= 24 * 3) target = MAX_OPT_COUNT
  return Math.min(MAX_OPT_COUNT, Math.max(MIN_OPT_COUNT, Math.min(target, validCount)))
}

function pickSpreadSubset (items, count) {
  if (items.length <= count) return items
  if (count <= 1) return [items[0]]
  const picked = []
  const used = new Set()
  for (let i = 0; i < count; i++) {
    const idx = Math.round((i * (items.length - 1)) / (count - 1))
    const item = items[idx]
    if (!used.has(item.key)) {
      used.add(item.key)
      picked.push(item)
    }
  }
  if (picked.length < count) {
    items.forEach(item => {
      if (picked.length >= count) return
      if (!used.has(item.key)) {
        used.add(item.key)
        picked.push(item)
      }
    })
  }
  return picked.sort((a, b) => a.minutes - b.minutes)
}

function fillMinOptions (items, durationMinutes) {
  if (items.length >= MIN_OPT_COUNT) return items
  const keys = new Set(items.map(i => i.key))
  const extras = []
  TIME_GROUP_CANDIDATES.forEach(c => {
    const item = makeItem(c, durationMinutes, false)
    if (item && !keys.has(item.key)) extras.push(item)
  })
  extras.sort((a, b) => {
    const da = Math.abs(a.points - TARGET_POINTS)
    const db = Math.abs(b.points - TARGET_POINTS)
    return da - db || a.minutes - b.minutes
  })
  const merged = [...items]
  extras.forEach(item => {
    if (merged.length >= MIN_OPT_COUNT) return
    if (!keys.has(item.key)) {
      keys.add(item.key)
      merged.push(item)
    }
  })
  return merged.sort((a, b) => a.minutes - b.minutes)
}

/**
 * 根据自定义时间跨度（毫秒）生成取值间隔下拉项
 */
export function buildCustomTimeGroupOpts (durationMs) {
  const durationMinutes = durationMs / (60 * 1000)
  if (!durationMinutes || durationMinutes < 1) return []

  const collect = (strict) => {
    const list = []
    TIME_GROUP_CANDIDATES.forEach(c => {
      const item = makeItem(c, durationMinutes, strict)
      if (item) list.push(item)
    })
    return list
  }

  let items = collect(true)
  if (!items.length) {
    const relaxed = collect(false)
    if (!relaxed.length) return []
    relaxed.sort((a, b) => a.score - b.score || a.minutes - b.minutes)
    const minScore = relaxed[0].score
    items = relaxed.filter(i => i.score === minScore)
  }
  items.sort((a, b) => a.minutes - b.minutes)

  items = fillMinOptions(items, durationMinutes)

  const count = desiredOptCount(items.length, durationMinutes)
  items = pickSpreadSubset(items, count)

  const seen = new Set()
  return items.filter(i => {
    if (seen.has(i.key)) return false
    seen.add(i.key)
    return true
  }).map(({ key, label }) => ({ key, label }))
}

/**
 * 预设时间 key 对应的跨度（分钟），用于推荐默认间隔
 */
export function getPresetTimeDurationMinutes (timeKey) {
  const m = String(timeKey || '').match(/^(\d+)h$/)
  if (m) return Number(m[1]) * 60
  if (timeKey === 'last_month') return 31 * 24 * 60
  return 60
}

/**
 * 当前值仍合法则保留，否则选最接近 TARGET_POINTS 的项
 */
export function pickRecommendedTimeGroupKey (opts, durationMinutes, currentKey) {
  if (!opts || !opts.length) return currentKey || '5m'
  if (currentKey && opts.some(o => o.key === currentKey)) return currentKey
  const duration = durationMinutes > 0 ? durationMinutes : 60
  let best = opts[0]
  let bestDiff = Infinity
  opts.forEach(o => {
    const intervalMinutes = parseMonitorIntervalToMinutes(o.key)
    if (!intervalMinutes) return
    const points = duration / intervalMinutes
    const diff = Math.abs(points - TARGET_POINTS)
    if (diff < bestDiff) {
      bestDiff = diff
      best = o
    }
  })
  return best.key
}

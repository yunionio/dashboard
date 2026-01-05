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
        from = moment.subtract(parseInt(from.replace('h', '')), 'hours').valueOf()
      } else if (from && to && /^\d+[h]$/.test(from + '') && /^\d+[h]$/.test(to + '')) {
        to = moment.subtract(parseInt(to.replace('h', '')), 'hours').valueOf()
        from = moment.subtract(parseInt(from.replace('h', '')), 'hours').valueOf()
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

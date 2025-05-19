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

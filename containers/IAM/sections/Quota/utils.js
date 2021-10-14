import http from '@/utils/http'

export const getRealSize = (val) => {
  return parseInt((val || 0) / 1024)
}

export const getRealPercentage = (usage, quota) => {
  if (isNaN(usage) || isNaN(quota) || quota < 0) {
    return 0
  }
  if (quota === 0 || (usage / quota > 1)) {
    return 100
  }
  return Math.round(usage / quota * 1000) / 10.0
}

export const getRealVal = (val) => {
  if (isNaN(val) || !val) {
    return 0
  }
  return val
}

export const getArrUniqData = (arr = [], field = 'name') => {
  const map = new Map()
  for (const item of arr) {
    if (!map.has(item[field])) {
      map.set(item[field], item)
    }
  }
  return [...map.values()]
}

export function fetchHypervisors (params, version = 'v2') {
  return http.get(`/${version}/capabilities`, { params })
}

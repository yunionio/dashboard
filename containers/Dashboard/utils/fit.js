export const generateFitLayout = (values) => {
  const layouts = Array.isArray(values) ? values : Object.values(values)
  const needUpgrade = layouts.some(item => {
    const { component, w } = item.layout || item
    const minWidth20Components = [
      'NumberCard',
      'Ring',
      'Notify',
      'Top5',
      'UnrecoveredAlarm',
      'AccountHealth',
      'UserInfo',
      'ServerNumberDetail',
    ]
    const minWidth40Components = [
      'VmHistoryCount',
      'AlertsTrend',
    ]
    if (minWidth20Components.includes(component)) {
      return w < 10
    } else if (minWidth40Components.includes(component)) {
      return w < 40
    }
  })
  if (needUpgrade) {
    layouts.forEach(item => {
      if (item.layout) {
        item.layout.w *= 4
        item.layout.x *= 4
        if (item.component !== 'Quota') {
          item.layout.h *= 2
          item.layout.y *= 2
        }
      } else {
        item.w *= 4
        item.x *= 4
        if (item.component !== 'Quota') {
          item.h *= 2
          item.y *= 2
        }
      }
    })
  }
  return values
}

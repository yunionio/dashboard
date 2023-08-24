import i18n from '@/locales'

export const getTimezoneOffset = (tz, hereDate) => {
  hereDate = new Date(hereDate || Date.now())
  hereDate.setMilliseconds(0)

  const hereOffsetHrs = hereDate.getTimezoneOffset() / 60 * -1
  const thereLocaleStr = hereDate.toLocaleString('en-US', { timeZone: tz })
  const thereDate = new Date(thereLocaleStr)
  const diffHrs = (thereDate.getTime() - hereDate.getTime()) / 1000 / 60 / 60
  const thereOffsetHrs = hereOffsetHrs + diffHrs

  const diffHour = parseInt(thereOffsetHrs)
  const diffMinute = (thereOffsetHrs - diffHour) * 60
  const diffTime = `${padZero(diffHour)}:${padZero(diffMinute)}`

  return {
    offset: thereOffsetHrs,
    offsetText: 'UTC' + (thereOffsetHrs < 0 ? '' : '+') + diffTime,
  }
}

function padZero (number) {
  return number.toString().padStart(2, '0')
}

export const getTimeZoneName = (tz) => {
  let name = tz
  const [n1, ...n2List] = tz.split('/')
  const n2 = n2List.join('/')
  if (n2) {
    name = i18n.te(`timezone.${n1}.${n2}`) ? i18n.t(`timezone.${n1}.${n2}`) : name
  }
  return name
}

export const getZoneTimeInfo = () => {
  const zoneNames = Intl.supportedValuesOf('timeZone')
  const ret = []
  zoneNames.map(tz => {
    const o = getTimezoneOffset(tz, new Date(2023, 0, 1))
    const name = getTimeZoneName(tz)
    ret.push({ key: tz, label: name, ...o })
  })
  ret.sort((a, b) => a.offset - b.offset)
  return ret
}

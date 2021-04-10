import _ from 'lodash'
import i18n from '@/locales'

export function measurementsUnits (res) {
  const ms = _.get(res, 'data.res_type_measurements')
  if (!ms) {
    console.log('empty measurements units', res)
    return []
  }

  const units = []
  for (const k in ms) {
    const m = ms[k]
    for (const mk in m) {
      if (m[mk].field_descriptions) {
        const fds = m[mk].field_descriptions
        for (const fdk in fds) {
          const v = fds[fdk]
          units[m[mk].measurement + '/' + v.name] = { label: i18n.t(v.display_name), unit: v.unit }
        }
      }
    }
  }
  return units
}

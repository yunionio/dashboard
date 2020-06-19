import { metricMaps, channelMaps, alertStrategyMaps, preiodMaps, levelMaps } from '@Monitor/constants'
import i18n from '@/locales'

export const levelColumn = {
  field: 'level',
  title: i18n.t('monitor.level'),
  minWidth: 40,
  slots: {
    default: ({ row }, h) => {
      const levelItem = levelMaps[row.level]
      const text = levelItem ? levelItem.label : row.level
      return [h('a-tag', {
        props: {
          color: levelItem ? levelItem.color : levelMaps.normal.color,
        },
      }, text)]
    },
  },
}

export const conditionColumn = {
  field: 'conditions',
  title: i18n.t('monitor.condition'),
  minWidth: 80,
  formatter: ({ row }) => {
    if (!row.channel || !row.channel.length) return '-'
    return row.channel.map(val => (channelMaps[val] || {}).label).join('、')
  },
}

export const strategyColumn = {
  field: 'common_alert_metric_details',
  title: i18n.t('monitor.strategy_detail'),
  minWidth: 120,
  formatter: ({ row }) => {
    if (row.common_alert_metric_details && row.common_alert_metric_details[0]) {
      const detail = row.common_alert_metric_details[0]
      const measurement = ((metricMaps[detail.measurement] || {}).label) || detail.measurement
      const reduce = (alertStrategyMaps[detail.reduce]) || detail.reduce
      const preiod = ((preiodMaps[row.period] || {}).label) || row.period
      return `${measurement}，${detail.field}${reduce} ${detail.comparator} ${detail.threshold} 触发，查询周期 ${preiod}`
    }
    return '-'
  },
}

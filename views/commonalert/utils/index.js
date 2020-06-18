import { metricMaps, channelMaps, alertStrategyMaps, preiodMaps } from '@Monitor/constants'

export const levelColumn = {
  field: 'level',
  title: '级别',
  slots: {
    default: ({ row }, h) => {
      const levelMap = {
        normal: {
          color: 'cyan',
          label: '普通',
        },
        important: {
          color: 'pink',
          label: '重要',
        },
        fatal: {
          color: 'red',
          label: '致命',
        },
      }
      const levelItem = levelMap[row.level]
      const text = levelItem ? levelItem.label : row.level
      return [h('a-tag', {
        props: {
          color: levelItem ? levelItem.color : levelMap.normal.color,
        },
      }, text)]
    },
  },
}

export const conditionColumn = {
  field: 'conditions',
  title: '通知方式',
  minWidth: 80,
  formatter: ({ row }) => {
    if (!row.channel || !row.channel.length) return '-'
    return row.channel.map(val => (channelMaps[val] || {}).label).join('、')
  },
}

export const strategyColumn = {
  field: 'common_alert_metric_details',
  title: '策略详情',
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

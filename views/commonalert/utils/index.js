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
  field: 'channel',
  title: i18n.t('monitor.channel'),
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

export const projectTableColumn = {
  field: 'project',
  title: i18n.t('monitor.text00015'),
  slots: {
    default: ({ row }, h) => {
      if (!row.tenant && !row.project_domain) {
        return i18n.t('monitor.text00024')
      }
      const domain = row.project_domain || row.domain
      if (!row.tenant && domain) {
        return `${domain}${i18n.t('monitor.text00025')}`
      }
      if (row.tenant && domain) {
        return [
          <list-body-cell-wrap copy field='tenant' row={row} />,
          <list-body-cell-wrap hide-field copy field="domain" row={{ domain }}>
            <span class='text-weak'>{ domain }</span>
          </list-body-cell-wrap>,
        ]
      }
    },
  },
}

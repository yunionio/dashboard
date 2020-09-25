import _ from 'lodash'
import * as R from 'ramda'
import { metric_zh, alertStrategyMaps, preiodMaps, levelMaps } from '@Monitor/constants'
import { channelMaps } from '@/constants'
import i18n from '@/locales'
import { transformUnit, arrayToObj } from '@/utils/utils'

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
  title: i18n.t('monitor.text_11'),
  minWidth: 80,
  formatter: ({ row }) => {
    if (!row.channel || !row.channel.length) return '-'
    return row.channel.filter(val => ~val.indexOf('robot')).map(val => (channelMaps[val] || {}).label).join('、')
  },
}

export const strategyColumn = (field = 'common_alert_metric_details') => ({
  field,
  title: i18n.t('monitor.strategy_detail'),
  minWidth: 120,
  formatter: ({ row }) => {
    if (row[field] && ((R.type(row[field]) === 'Array') || R.type(row[field]) === 'Object') && !R.isEmpty(row[field])) {
      let detail = ''
      if (R.type(row[field]) === 'Array') {
        detail = row[field][0]
      } else if (R.type(row[field]) === 'Object') {
        detail = row[field]
      }
      let measurement = detail.measurement_display_name || detail.measurement || detail.measurement_desc
      if (metric_zh[measurement]) measurement = metric_zh[measurement]
      let metric = _.get(detail, 'field_description.display_name') || detail.field_desc
      if (metric) {
        metric = metric_zh[metric] || _.get(detail, 'field_description.name') || detail.field
      }
      const reduce = (alertStrategyMaps[detail.reduce]) || ''
      const preiod = ((preiodMaps[row.period] || {}).label) || row.period || ((preiodMaps[detail.period] || {}).label) || detail.period
      const unit = detail.field_description ? _.get(detail, 'field_description.unit') : (R.type(row.eval_data) === 'Array' ? row.eval_data[0].unit : '')
      const threshold = transformUnit(detail.threshold, unit)
      return i18n.t('monitor.text_6', [measurement, metric, reduce, detail.comparator, threshold.text, preiod])
    }
    return '-'
  },
})

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

export const recipientsColumn = recipientList => ({
  field: 'recipients',
  title: i18n.t('compute.text_740'),
  slots: {
    default: ({ row }, h) => {
      if (!row.recipients || !row.recipients.length) return '-'
      const recipientsMap = arrayToObj(recipientList, 'id')
      const recipientNames = row.recipients.map(val => recipientsMap[val].name)
      return recipientNames.map(val => {
        return h('a-tag', val)
      })
    },
  },
})

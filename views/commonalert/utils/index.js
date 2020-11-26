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

export const strategyColumn = (field = 'common_alert_metric_details', title = i18n.t('monitor.strategy_detail')) => ({
  field,
  title,
  minWidth: 120,
  slots: {
    default: ({ row }, h) => {
      const { filters, strategy } = getMetircAlertUtil(row, field)
      let filterNode = null
      if (filters.length > 0) {
        filterNode = (
          <a-tag class="w-100">
            <div>{ i18n.t('monitor.text_101') }: </div>
            { filters.map(v => <div class="w-100 text-truncate" title={v}>{v}</div>) }
          </a-tag>
        )
      }
      return [
        <div>
          <div>{strategy}</div>
          { filterNode }
        </div>,
      ]
    },
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

export function getMetircAlertUtil (row, field) {
  let strategy = '-'
  const filters = []
  if (row[field] && ((R.type(row[field]) === 'Array') || R.type(row[field]) === 'Object') && !R.isEmpty(row[field])) {
    let detail = ''
    if (R.type(row[field]) === 'Array') {
      detail = row[field][0]
    } else if (R.type(row[field]) === 'Object') {
      detail = row[field]
    }
    let measurement = detail.measurement_display_name || detail.measurement_desc || detail.measurement
    if (metric_zh[measurement]) measurement = metric_zh[measurement]
    let metric = _.get(detail, 'field_description.display_name') || detail.field_desc || detail.field
    if (metric) {
      metric = metric_zh[metric] || metric
    }
    const reduce = (alertStrategyMaps[detail.reduce]) || ''
    let preiod = ((preiodMaps[row.period] || {}).label) || row.period || ((preiodMaps[detail.period] || {}).label) || detail.period
    const unit = detail.field_description ? _.get(detail, 'field_description.unit') : (R.type(row.eval_data) === 'Array' ? row.eval_data[0].unit : '')
    const threshold = R.is(String, detail.threshold) ? { text: detail.threshold } : transformUnit(detail.threshold, unit)
    strategy = i18n.t('monitor.text_6', [measurement, metric, reduce, detail.comparator, threshold.text])
    if (preiod) {
      preiod = preiod.replace(i18n.t('monitor.text_103'), '')
      strategy += `${i18n.t('monitor.text_102', [preiod])}`
    }
    if (detail.filters && detail.filters.length) {
      detail.filters.forEach((val, i) => {
        if (val.key) filters.push(`${(val.condition && i !== 0) ? val.condition : ''} ${val.key} ${val.operator} ${val.value}`)
      })
    }
  }
  return {
    strategy,
    filters,
  }
}

import _ from 'lodash'
import * as R from 'ramda'
import { metric_zh, alertStrategyMaps, preiodMaps, levelMaps } from '@Monitor/constants'
import { channelMaps } from '@/constants'
import i18n from '@/locales'
import { transformUnit, arrayToObj } from '@/utils/utils'
import { currencyUnitMap } from '@/constants/currency'

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
    const alert_duration = row.alert_duration ? i18n.t('monitor.list.duration.label', [row.alert_duration]) : row[field].alert_duration ? i18n.t('monitor.list.duration.label', [row[field].alert_duration]) : ''
    let preiod = ((preiodMaps[row.period] || {}).label) || row.period || ((preiodMaps[detail.period] || {}).label) || detail.period
    const unit = detail.field_description ? _.get(detail, 'field_description.unit') : (R.type(row.eval_data) === 'Array' ? (_.get(row, 'eval_data[0].unit') || '') : '')
    const threshold = R.is(String, detail.threshold) ? { text: detail.threshold } : transformUnit(detail.threshold, unit)
    let comparator = detail.comparator
    let txt = threshold.text
    if (detail.comparator === 'within_range' && detail.within_range) {
      comparator = ''
      txt = `[${detail.within_range[0]}${threshold.unit}, ${detail.within_range[1]}${threshold.unit}]`
    }
    strategy = i18n.t('monitor.text_6', [measurement, metric, reduce, alert_duration, comparator, txt])
    if (detail.condition_type === 'nodata_query') { // 系统上报数据为空
      strategy = i18n.t('monitor.text_108', [alert_duration])
    }
    if (preiod) {
      preiod = preiod.replace(i18n.t('monitor.text_103'), '')
      strategy += `${i18n.t('monitor.text_102', [preiod])}`
    }

    const silent_period = row.silent_period || row[field].silent_period
    if (silent_period) {
      let p = silent_period
      if (p.endsWith('m')) {
        const pi = parseInt(p.replace('m', ''))
        if (pi && pi >= 60 && pi % 60 === 0) {
          p = i18n.t('monitor.duration.silent.hour', [pi / 60])
        } else {
          p = i18n.t('monitor.duration.silent.minute', [p.replace('m', '')])
        }
      } else if (p.endsWith('h')) {
        p = i18n.t('monitor.duration.silent.hour', [p.replace('h', '')])
      }
      strategy += `${i18n.t('monitor.commonalerts.list.silent', [p])}`
    }

    if (detail.filters && detail.filters.length) {
      detail.filters.forEach((val, i) => {
        if (val.key) {
          if (val.key !== 'brand' || val.value.toLowerCase() !== 'onecloud') {
            filters.push(`${(val.condition && i !== 0) ? val.condition : ''} ${val.key} ${val.operator} ${val.value}`)
          } else {
            filters.push(`${(val.condition && i !== 0) ? val.condition : ''} ${val.key} ${val.operator} ${i18n.t('brand')}`)
          }
        }
      })
    }
  }
  return {
    strategy,
    filters,
  }
}

export const getResTypeColumn = ({ field = 'common_alert_metric_details' } = {}) => ({
  field: 'res_type',
  title: i18n.t('monitor.text_97'),
  formatter: ({ row }) => {
    const str = _.get(row[field], '[0].res_type')
    if (!str) return '-'
    if (i18n.te(`dictionary.${str}`)) return i18n.t(`dictionary.${str}`)
    return str
  },
})

export const getVerifiedContactTypesTableColumn = ({ field = 'channel', title = i18n.t('common_599'), vm } = {}) => {
  return {
    title: i18n.t('common_599'),
    field: 'channel',
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        const color = '#52c41a'
        const channel = row.channel || []
        const renderComponents = []
        channel.forEach((ctype) => {
          switch (ctype) {
            case 'webconsole':
              renderComponents.push(<icon type='webconsole' style={{ color: color }} title={i18n.t('dictionary.webconsole')} />)
              break
            case 'email':
              renderComponents.push(<icon class='ml-2' type='email' style={{ color: color }} title={i18n.t('common.email')} />)
              break
            case 'mobile':
              renderComponents.push(<icon class='ml-2' type='mobile' style={{ color: color }} title={i18n.t('common.mobile')} />)
              break
            case 'dingtalk':
              renderComponents.push(<icon class='ml-2' type='dingtalk' style={{ color: color }} title={i18n.t('common.dingtalk')} />)
              break
            case 'feishu':
              renderComponents.push(<icon class='ml-2' type='feishu' style={{ color: color }} title={i18n.t('common.feishu')} />)
              break
            case 'workwx':
              renderComponents.push(<icon class='ml-2' type='workwx' style={{ color: color }} title={i18n.t('common.workwx')} />)
              break
            default:
              break
          }
        })
        return renderComponents
      },
    },
  }
}

export const getValueWithUnit = (value = 0, unit = '') => {
  const currencyUnitList = Object.keys(currencyUnitMap)
  // 金额类型的单位
  for (let i = 0; i < currencyUnitList.length; i++) {
    if (unit.indexOf(currencyUnitList[i]) !== -1) {
      return `${currencyUnitMap[currencyUnitList[i]].sign}${value}`
    }
  }
  return value
}

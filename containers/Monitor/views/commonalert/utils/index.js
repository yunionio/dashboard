import _ from 'lodash'
import * as R from 'ramda'
import { metric_zh, alertStrategyMaps, preiodMaps, levelMaps } from '@Monitor/constants'
import { channelMaps } from '@/constants'
import i18n from '@/locales'
import { transformUnit, arrayToObj } from '@/utils/utils'
import { currencyUnitMap } from '@/constants/currency'

export const levelColumn = () => ({
  field: 'level',
  title: i18n.t('monitor.level'),
  minWidth: 40,
  sortable: true,
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
})

export const conditionColumn = {
  field: 'channel',
  title: i18n.t('monitor.text_11'),
  minWidth: 80,
  formatter: ({ row }) => {
    if (!row.channel || !row.channel.length) return '-'
    return row.channel.filter(val => ~val.indexOf('robot')).map(val => (channelMaps[val] || {}).label).join('、')
  },
}

export const robotsColumn = (robotList) => ({
  field: 'robot_ids',
  title: i18n.t('monitor.text_11'),
  slots: {
    default: ({ row }, h) => {
      if (!row.robot_ids || !row.robot_ids.length) return '-'
      const robotsMap = arrayToObj(robotList, 'id')
      const robotNames = row.robot_ids.map(val => robotsMap[val].name)
      return robotNames.map(val => {
        return h('a-tag', val)
      })
    },
  },
})

export const strategyColumn = (field = 'common_alert_metric_details', title = i18n.t('monitor.strategy_detail'), data) => ({
  field,
  title,
  minWidth: 120,
  slots: {
    default: ({ row }, h) => {
      const { filters, strategyConfig, strategyArr = [] } = getMetircAlertUtil(data || row, field)
      const periodTxt = i18n.t('monitor.text_102', [strategyConfig.period])

      if (!(data || row)[field]) return '-'
      let filterNode = null
      if (filters.length > 0) {
        filterNode = (
          <a-tag class="w-100">
            <div>{i18n.t('monitor.text_101')}: </div>
            {filters.map(v => <div class="w-100 text-truncate" title={v}>{v}</div>)}
          </a-tag>
        )
      }
      const strategys = strategyArr.map(item => <div>{item}</div>)
      return [
        <div>
          <div>{i18n.t('monitor.commonalert.alert_condition.content')}{periodTxt}:</div>
          <div>{strategys}</div>
          {filterNode}
        </div>,
      ]
    },
  },
  formatter: ({ row }) => {
    const { filters, strategyConfig, strategyArr = [] } = getMetircAlertUtil(data || row, field)
    const periodTxt = i18n.t('monitor.text_102', [strategyConfig.period])

    if (!(data || row)[field]) return ''
    let filterNode = null
    if (filters.length > 0) {
      filterNode = i18n.t('monitor.text_101') + ':'
      filters.map(v => {
        filterNode += v
      })
    }
    const strategys = strategyArr.filter(item => item).join(',')
    return i18n.t('monitor.commonalert.alert_condition.content') + periodTxt + ':' + strategys + (filterNode || '')
  },
})

export const reasonColumn = () => ({
  field: 'reason',
  title: i18n.t('monitor.alert_reason'),
  minWidth: 100,
  formatter: ({ row }) => {
    return row.reason || '-'
  },
})

export const projectTableColumn = () => ({
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
            <span class='text-weak'>{domain}</span>
          </list-body-cell-wrap>,
        ]
      }
    },
  },
})

export const recipientsColumn = recipientList => ({
  field: 'recipients',
  title: i18n.t('compute.text_740'),
  slots: {
    default: ({ row }, h) => {
      if (!row.recipients || !row.recipients.length) return '-'
      const recipientsMap = arrayToObj(recipientList, 'id')
      const recipientNames = []
      row.recipients.map(val => {
        if (recipientsMap[val]) {
          recipientNames.push(recipientsMap[val].name)
        }
      })
      return recipientNames.map(val => {
        return h('a-tag', val)
      })
    },
  },
})

export const rolesColumn = roleList => ({
  field: 'role_ids',
  title: i18n.t('monitor.role'),
  slots: {
    default: ({ row }, h) => {
      if (!row.role_ids || !row.role_ids.length) return '-'
      const rolesMap = arrayToObj(roleList, 'id')
      const roleNames = []
      row.role_ids.map(val => {
        if (rolesMap[val]) {
          roleNames.push(rolesMap[val].name)
        }
      })
      return roleNames.map(val => {
        return h('a-tag', val)
      })
    },
  },
})

export function getMetircAlertUtil (row, field, condition) {
  let strategy = '-'
  let strategyConfig = {
    measurement: '',
    period: '', // 时间间隔 2h 14d
    metric: '', // 监控指标
    comparator: '', // > < within
    threshold: null, // 阈值
    unit: '', // 单位
    time_from: row.time_from,
  }
  const strategyArr = []
  const strategyConfigArr = []
  const filters = []
  const getStrategyInfo = (detail) => {
    let measurement = detail.measurement_display_name || detail.measurement_desc || detail.measurement
    if (metric_zh[measurement]) measurement = metric_zh[measurement]
    strategyConfig.measurement = measurement
    let metric = _.get(detail, 'field_description.display_name') || detail.field_desc || detail.field
    if (metric) {
      metric = metric_zh[metric] || metric
    }
    strategyConfig.metric = metric
    const reduce = (alertStrategyMaps[detail.reduce || detail.reducer || 'avg']) || ''
    const alert_duration = row.alert_duration ? i18n.t('monitor.list.duration.label', [row.alert_duration]) : row[field].alert_duration ? i18n.t('monitor.list.duration.label', [row[field].alert_duration]) : ''
    let preiod = ((preiodMaps[row.period] || {}).label) || ((preiodMaps[detail.period] || {}).label) || row.period || detail.period
    let unit = detail.field_description ? _.get(detail, 'field_description.unit') : (R.type(row.eval_data) === 'Array' ? (_.get(row, 'eval_data[0].unit') || '') : '')
    let threshold = R.is(String, detail.threshold) ? { text: detail.threshold } : transformUnit(detail.threshold, unit)
    if (detail.measurement === 'cloudaccount_balance' && unit === 'RMB') {
      unit = ''
      if (detail.filters && detail.filters.length) {
        const targets = detail.filters.filter(item => item.key === 'currency')
        const cs = []
        targets.map(item => {
          if (item.value && !cs.includes(item.value)) {
            cs.push(item.value)
          }
        })
        if (cs.length === 1) {
          unit = currencyUnitMap[cs[0]]?.sign || ''
        }
      }
      threshold = R.is(String, detail.threshold) ? { text: detail.threshold } : unit ? { text: `${unit}${detail.threshold}` } : { text: detail.threshold }
    }
    let comparator = detail.comparator
    let txt = threshold.text
    if (detail.comparator === 'within_range' && detail.within_range) {
      comparator = ''
      txt = `[${detail.within_range[0]}${threshold.unit}, ${detail.within_range[1]}${threshold.unit}]`
      strategyConfig.within_range = detail.within_range
    }
    if (detail.comparator === 'within_range' && detail.threshold_range) {
      comparator = ''
      txt = i18n.t('monitor.threshold_range_in', [`${detail.threshold_range[0]}${unit || detail.unit || ''}`, `${detail.threshold_range[1]}${unit || detail.unit || ''}`])
      strategyConfig.within_range = detail.threshold_range
    }
    if (detail.comparator === 'outside_range' && detail.threshold_range) {
      comparator = ''
      txt = i18n.t('monitor.threshold_range_out', [`${detail.threshold_range[0]}${unit || detail.unit || ''}`, `${detail.threshold_range[1]}${unit || detail.unit || ''}`])
      strategyConfig.outside_range = detail.threshold_range
    }
    strategyConfig.comparator = detail.comparator
    strategyConfig.threshold = detail.threshold
    strategyConfig.unit = unit
    strategy = i18n.t('monitor.text_6', [measurement, metric, reduce, alert_duration, comparator, txt])
    if (detail.condition_type === 'nodata_query') { // 系统上报数据为空
      strategy = i18n.t('monitor.text_108', [alert_duration])
    }
    if (condition) return strategy // 只要触发条件信息
    if (preiod) {
      preiod = preiod.replace(i18n.t('monitor.text_103'), '')
      // strategy += `${i18n.t('monitor.text_102', [preiod])}`
      strategyConfig.period = preiod
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
      strategyConfig.silent_period = silent_period
    }
    return {
      strategy,
      strategyConfig,
    }
  }
  if (row[field] && ((R.type(row[field]) === 'Array') || R.type(row[field]) === 'Object') && !R.isEmpty(row[field])) {
    let detail = ''
    if (R.type(row[field]) === 'Array') {
      detail = row[field][0]
      row[field].forEach(item => {
        const strategyInfo = getStrategyInfo(item)
        strategyArr.push(strategyInfo.strategy)
        strategyConfigArr.push(strategyInfo.strategyConfig)
      })
    } else if (R.type(row[field]) === 'Object') {
      detail = row[field]
      const strategyInfo = getStrategyInfo(detail)
      strategy = strategyInfo.strategy
      strategyConfig = strategyInfo.strategyConfig
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
    strategyConfig,
    filters,
    strategyArr,
    strategyConfigArr,
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
              renderComponents.push(<icon class="mr-2" type='webconsole' style={{ color: color }} title={i18n.t('dictionary.webconsole')} />)
              break
            case 'email':
              renderComponents.push(<icon class='mr-2' type='email' style={{ color: color }} title={i18n.t('common.email')} />)
              break
            case 'mobile':
              renderComponents.push(<icon class='mr-2' type='mobile' style={{ color: color }} title={i18n.t('common.mobile')} />)
              break
            case 'dingtalk':
              renderComponents.push(<icon class='mr-2' type='dingtalk' style={{ color: color }} title={i18n.t('common.dingtalk')} />)
              break
            case 'feishu':
              renderComponents.push(<icon class='mr-2' type='feishu' style={{ color: color }} title={i18n.t('common.feishu')} />)
              break
            case 'workwx':
              renderComponents.push(<icon class='mr-2' type='workwx' style={{ color: color }} title={i18n.t('common.workwx')} />)
              break
            case 'alert_event':
              renderComponents.push(<icon class="mr-2" type="alert-event" style={{ color: color }} title={i18n.t('common.workflow.alert_event')} />)
              break
            case 'alert_ticket':
              renderComponents.push(<icon class="mr-2" type="navbar-process" style={{ color: color }} title={i18n.t('common.workflow.alert_ticket')} />)
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
      return `${currencyUnitMap[currencyUnitList[i]].sign} ${value}`
    }
  }
  return value
}

export const getStrategyInfo = (detail) => {
  let strategy = '-'
  const strategyConfig = {
    measurement: '',
    period: '', // 时间间隔 2h 14d
    metric: '', // 监控指标
    comparator: '', // > < within
    threshold: null, // 阈值
    unit: '', // 单位
    time_from: detail.time_from,
  }
  let measurement = detail.measurement_display_name || detail.measurement_desc || detail.measurement
  if (metric_zh[measurement]) measurement = metric_zh[measurement]
  strategyConfig.measurement = measurement
  let metric = _.get(detail, 'field_description.display_name') || detail.field_desc || detail.field
  if (metric) {
    metric = metric_zh[metric] || metric
  }
  strategyConfig.metric = metric
  const reduce = (alertStrategyMaps[detail.reduce || detail.reducer || 'avg']) || ''
  const alert_duration = detail.alert_duration ? i18n.t('monitor.list.duration.label', [detail.alert_duration]) : detail.alert_duration ? i18n.t('monitor.list.duration.label', [detail.alert_duration]) : ''
  let preiod = ((preiodMaps[detail.period] || {}).label) || detail.period
  let unit = detail.field_description ? _.get(detail, 'field_description.unit') : (R.type(detail.eval_data) === 'Array' ? (_.get(detail, 'eval_data[0].unit') || '') : '')
  let threshold = R.is(String, detail.threshold) ? { text: detail.threshold } : transformUnit(detail.threshold, unit)
  if (detail.measurement === 'cloudaccount_balance' && unit === 'RMB') {
    unit = ''
    if (detail.filters && detail.filters.length) {
      const targets = detail.filters.filter(item => item.key === 'currency')
      const cs = []
      targets.map(item => {
        if (item.value && !cs.includes(item.value)) {
          cs.push(item.value)
        }
      })
      if (cs.length === 1) {
        unit = currencyUnitMap[cs[0]]?.sign || ''
      }
    }
    threshold = R.is(String, detail.threshold) ? { text: detail.threshold } : unit ? { text: `${unit}${detail.threshold}` } : { text: detail.threshold }
  }
  let comparator = detail.comparator
  let txt = threshold.text
  if (detail.comparator === 'within_range' && detail.within_range) {
    comparator = ''
    txt = `[${detail.within_range[0]}${threshold.unit}, ${detail.within_range[1]}${threshold.unit}]`
    strategyConfig.within_range = detail.within_range
  }
  if (detail.comparator === 'within_range' && detail.threshold_range) {
    comparator = ''
    txt = i18n.t('monitor.threshold_range_in', [`${detail.threshold_range[0]}${unit || detail.unit || ''}`, `${detail.threshold_range[1]}${unit || detail.unit || ''}`])
    strategyConfig.within_range = detail.threshold_range
  }
  if (detail.comparator === 'outside_range' && detail.threshold_range) {
    comparator = ''
    txt = i18n.t('monitor.threshold_range_out', [`${detail.threshold_range[0]}${unit || detail.unit || ''}`, `${detail.threshold_range[1]}${unit || detail.unit || ''}`])
    strategyConfig.outside_range = detail.threshold_range
  }
  strategyConfig.comparator = detail.comparator
  strategyConfig.threshold = detail.threshold
  strategyConfig.unit = unit
  strategy = i18n.t('monitor.text_6', [measurement, metric, reduce, alert_duration, comparator, txt])
  if (detail.condition_type === 'nodata_query') { // 系统上报数据为空
    strategy = i18n.t('monitor.text_108', [alert_duration])
  }
  if (preiod) {
    preiod = preiod.replace(i18n.t('monitor.text_103'), '')
    // strategy += `${i18n.t('monitor.text_102', [preiod])}`
    strategyConfig.period = preiod
  }
  const silent_period = detail.silent_period
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
    strategyConfig.silent_period = silent_period
  }
  return {
    strategy,
    strategyConfig,
  }
}

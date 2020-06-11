import moment from 'moment'
import i18n from '@/locales'

export const getOperationColumns = () => {
  return {
    field: 'operation',
    title: '操作动作',
    width: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return i18n.t('cloudenv.ScheduledtaskRuleAction')[row.operation] || '-'
    },
  }
}

export const getResourceColumns = () => {
  return {
    field: 'operation',
    title: '资源绑定',
    width: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return i18n.t('cloudenv.ScheduledtaskResource')[row.operation] || '-'
    },
  }
}

export const getResourceTypeColumns = () => {
  return {
    field: 'resource_type',
    title: '资源类型',
    width: 110,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return i18n.t('cloudenv.ScheduledtaskResourceType')[row.resource_type] || '-'
    },
  }
}

export const getResourceNumberColumns = (that) => {
  return {
    field: 'labels',
    title: '资源数量',
    width: 110,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return (row.labels && row.labels.length) || 0
    },
  }
}

export const getLabelTypeColumns = () => {
  return {
    field: 'label_type',
    title: '资源绑定',
    width: 110,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return i18n.t('cloudenv.ScheduledtaskLabelType')[row.label_type] || '-'
    },
  }
}

export const getCycleTypeCloumns = () => {
  return {
    field: 'cycle_type',
    title: '触发频率',
    width: 80,
    formatter: ({ row }) => {
      if (row.scheduled_type === 'timing') {
        row.cycle_timer.cycle_type = 'one'
      }
      return i18n.t('cloudenv.ScheduledtaskGroupCycleType')[row.cycle_timer.cycle_type]
    },
  }
}

export const getCycleTimerColumns = ({ timeFormat = 'YYYY-MM-DD HH:mm:ss' } = {}) => {
  return {
    field: 'cycle_timer',
    title: '策略详情',
    minWidth: 300,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        const hour = row.cycle_timer.hour
        const minute = row.cycle_timer.minute
        const timer = `${hour > 9 ? hour : `0${hour}`}:${minute > 9 ? minute : `0${minute}`}触发`
        if (row.scheduled_type === 'cycle') {
          const cycleType = i18n.t('cloudenv.ScheduledtaskGroupCycleType')[row.cycle_timer.cycle_type]
          const startEndTime = `有效时间为${moment(row.cycle_timer.start_time).format(timeFormat)}至${moment(row.cycle_timer.end_time).format(timeFormat)}`
          if (row.cycle_timer.cycle_type === 'day') {
            return `${cycleType} ${timer} ${startEndTime}`
          } else if (row.cycle_timer.cycle_type === 'week') {
            const weekDays = row.cycle_timer.week_days.map((v) => {
              return i18n.t('flexGroupSubCycleTypeWeek')[v]
            })
            return `${cycleType} 【${weekDays.join('|')}】 ${timer} ${startEndTime}`
          } if (row.cycle_timer.cycle_type === 'month') {
            const monthDays = row.cycle_timer.month_days.map((v) => {
              return `${v}号`
            })
            return `${cycleType} 【${monthDays.join('|')}】 ${timer} ${startEndTime}`
          }
        } else {
          return `${moment(row.timer.exec_time).format(timeFormat)}触发`
        }
      },
    },
  }
}

export const getTimerDescColumns = () => {
  return {
    field: 'timer_desc',
    title: '策略详情',
    minWidth: 300,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return row.timer_desc || '-'
    },
  }
}

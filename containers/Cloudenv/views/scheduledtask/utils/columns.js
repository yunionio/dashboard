import moment from 'moment'
import i18n from '@/locales'

export const getOperationColumns = () => {
  return {
    field: 'operation',
    title: i18n.t('cloudenv.text_425'),
    width: 80,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return i18n.t('cloudenvScheduledtaskRuleAction')[row.operation] || '-'
    },
  }
}

export const getResourceColumns = () => {
  return {
    field: 'operation',
    title: i18n.t('cloudenv.text_426'),
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
    title: i18n.t('cloudenv.text_384'),
    width: 110,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return i18n.t('cloudenvScheduledtaskResourceType')[row.resource_type] || '-'
    },
  }
}

export const getResourceNumberColumns = (that) => {
  return {
    field: 'labels',
    title: i18n.t('cloudenv.text_417'),
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
    title: i18n.t('cloudenv.text_426'),
    width: 110,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return i18n.t('cloudenvScheduledtaskLabelType')[row.label_type] || '-'
    },
  }
}

export const getCycleTypeCloumns = () => {
  return {
    field: 'cycle_type',
    title: i18n.t('cloudenv.text_433'),
    width: 80,
    formatter: ({ row }) => {
      if (row.scheduled_type === 'timing') {
        row.cycle_timer.cycle_type = 'one'
      }
      return i18n.t('cloudenvScheduledtaskGroupCycleType')[row.cycle_timer.cycle_type]
    },
  }
}

export const getCycleTimerColumns = ({ timeFormat = 'YYYY-MM-DD HH:mm:ss' } = {}) => {
  return {
    field: 'cycle_timer',
    title: i18n.t('cloudenv.text_427'),
    minWidth: 200,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        const hour = row.cycle_timer.hour
        const minute = row.cycle_timer.minute
        const timer = i18n.t('cloudenv.text_465', [`${hour > 9 ? hour : `0${hour}`}:${minute > 9 ? minute : `0${minute}`}`])
        if (row.scheduled_type === 'cycle') {
          const cycleType = i18n.t('cloudenvScheduledtaskGroupCycleType')[row.cycle_timer.cycle_type]
          const startEndTime = i18n.t('cloudenv.text_466', [moment(row.cycle_timer.start_time).format(timeFormat), moment(row.cycle_timer.end_time).format(timeFormat)])
          if (row.cycle_timer.cycle_type === 'day') {
            return `${cycleType} ${timer} ${startEndTime}`
          } else if (row.cycle_timer.cycle_type === 'week') {
            const weekDays = row.cycle_timer.week_days.map((v) => {
              return i18n.t('flexGroupSubCycleTypeWeek')[v]
            })
            return `${cycleType} 【${weekDays.join('|')}】 ${timer} ${startEndTime}`
          } if (row.cycle_timer.cycle_type === 'month') {
            const monthDays = row.cycle_timer.month_days.map((v) => {
              return i18n.t('cloudenv.text_436', [v])
            })
            return `${cycleType} 【${monthDays.join('|')}】 ${timer} ${startEndTime}`
          }
        } else {
          return i18n.t('cloudenv.text_467', [moment(row.timer.exec_time).format(timeFormat)])
        }
      },
    },
  }
}

export const getTimerDescColumns = () => {
  return {
    field: 'timer_desc',
    title: i18n.t('cloudenv.text_427'),
    minWidth: 300,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return row.timer_desc || '-'
    },
  }
}

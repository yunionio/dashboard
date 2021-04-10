import { STRATEGY_CN, RES_TYPES } from '@Cloudenv/constants/sched'
import i18n from '@/locales'

export const getDefaultStrategyTableColumn = () => {
  return {
    field: 'default_strategy',
    title: i18n.t('cloudenv.text_413'),
    width: 80,
    formatter: ({ row }) => {
      return STRATEGY_CN[row.default_strategy] || i18n.t('cloudenv.text_4')
    },
  }
}

export const getResourceTypeTableColumn = () => {
  return {
    field: 'resource_type',
    title: i18n.t('cloudenv.text_384'),
    width: 120,
    formatter: ({ row }) => {
      return RES_TYPES[row.resource_type] || i18n.t('cloudenv.text_4')
    },
  }
}

export const getResourceCountTableColumn = () => {
  return {
    field: 'resource_count',
    title: i18n.t('cloudenv.text_417'),
    width: 80,
    formatter: ({ row }) => {
      return row.resource_count || '0'
    },
  }
}

export const getDynamicSchedtagCountTableColumn = () => {
  return {
    field: 'dynamic_schedtag_count',
    title: i18n.t('cloudenv.text_418'),
    width: 150,
    formatter: ({ row }) => {
      return row.dynamic_schedtag_count || '0'
    },
  }
}

export const getSchedpolicyCountTableColumn = () => {
  return {
    field: 'schedpolicy_count',
    title: i18n.t('cloudenv.text_419'),
    width: 120,
    formatter: ({ row }) => {
      return row.schedpolicy_count || '0'
    },
  }
}

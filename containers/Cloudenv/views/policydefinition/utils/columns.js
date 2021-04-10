import { CategoryMap, ConditionMap } from '../constants'
import i18n from '@/locales'

export const getCategoryTableColumn = () => {
  return {
    field: 'category',
    title: i18n.t('cloudenv.text_360'),
    minWidth: 70,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return CategoryMap[row.category] || '-'
    },
  }
}

export const getConditionTableColumn = () => {
  return {
    field: 'condition',
    title: i18n.t('cloudenv.text_21'),
    minWidth: 70,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return i18n.t('cloudenv.text_394', [ConditionMap[row.condition]]) || '-'
    },
  }
}

export const getParameterTableColumn = () => {
  return {
    field: 'parameter',
    title: i18n.t('cloudenv.text_389'),
    minWidth: 70,
    showOverflow: 'title',
    formatter: ({ row }) => {
      if (row.parameters) {
        return JSON.stringify(row.parameters)
      }
      return '-'
    },
  }
}

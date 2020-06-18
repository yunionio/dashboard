import { CategoryMap, ConditionMap } from '../constants'

export const getCategoryTableColumn = () => {
  return {
    field: 'category',
    title: '类型',
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
    title: '策略',
    minWidth: 70,
    showOverflow: 'title',
    formatter: ({ row }) => {
      return `要求${ConditionMap[row.condition]}` || '-'
    },
  }
}

export const getParameterTableColumn = () => {
  return {
    field: 'parameter',
    title: '参数',
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

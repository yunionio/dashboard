import { STRATEGY_CN, RES_TYPES } from '@Cloudenv/constants/sched'

export const getDefaultStrategyTableColumn = () => {
  return {
    field: 'default_strategy',
    title: '偏好',
    width: 80,
    formatter: ({ row }) => {
      return STRATEGY_CN[row.default_strategy] || '无'
    },
  }
}

export const getResourceTypeTableColumn = () => {
  return {
    field: 'resource_type',
    title: '资源类型',
    width: 120,
    formatter: ({ row }) => {
      return RES_TYPES[row.resource_type] || '无'
    },
  }
}

export const getResourceCountTableColumn = () => {
  return {
    field: 'resource_count',
    title: '资源数量',
    width: 80,
    formatter: ({ row }) => {
      return row.host_count || row.other_count || '0'
    },
  }
}

export const getDynamicSchedtagCountTableColumn = () => {
  return {
    field: 'dynamic_schedtag_count',
    title: '关联动态调度标签',
    width: 120,
    formatter: ({ row }) => {
      return row.dynamic_schedtag_count || '0'
    },
  }
}

export const getSchedpolicyCountTableColumn = () => {
  return {
    field: 'schedpolicy_count',
    title: '关联调度策略',
    width: 120,
    formatter: ({ row }) => {
      return row.schedpolicy_count || '0'
    },
  }
}

import { WORKFLOW_TYPES } from '@/constants/workflow'
import { sizestr } from '@/utils/utils'

export const statusMap = function (pdk) {
  const mp = {
    ACTIVE: {
      text: pdk === WORKFLOW_TYPES.CUSTOMER_SERVICE ? '待处理' : '待审批',
      color: '#f6a100',
    },
    COMPLETED: {
      text: '已完成',
      color: '#7ed321',
    },
    EXTERNALLY_TERMINATED: {
      text: '已撤销',
      color: '#8a94a6',
    },
    CUSTOM_TODO: {
      text: '待处理',
      color: '#f6a100',
    },
    CUSTOM_DOING: {
      text: '处理中',
      color: '#f6a100',
    },
  }
  return mp
}

// 审批结果
export const auditStatusMap = function (pdk) {
  const mp = {
    approved: {
      text: '通过',
      color: '#7ed321',
    },
    refused: {
      text: pdk === WORKFLOW_TYPES.CUSTOMER_SERVICE ? '不满意' : '驳回',
      color: '#F56C6C',
    },
  }
  return mp
}

// 状态结果
export const approveStatusMap = {
  ServiceTask_Onecloud: {
    true: '调用接口成功',
    false: '调用接口失败',
  },
  ServiceTask_StatusCheck: {
    true: '服务调用成功',
    false: '服务调用失败',
  },
  UserTask_User_Confirm: {
    true: '用户重试',
    false: '用户放弃',
  },
}

export const getServerConf = (row) => {
  if (row.variables) {
    return JSON.parse((row.variables['server-create-paramter'] || row.variables.paramter) || '{}')
  }
  return {}
}

export function getIncrementFlag (newVal, oldVal, unit) {
  if (newVal > oldVal) {
    return `+${newVal - oldVal}`
  }
  if (newVal < oldVal) {
    return `-${oldVal - newVal}`
  }
}

export const diff = (compareValue, baseValue, unit = '个') => {
  if (!compareValue) compareValue = 0
  if (!baseValue) baseValue = 0
  let sign = '+'
  let diff = 0
  diff = baseValue - compareValue
  if (diff < 0) sign = '-'
  if (unit === 'sizestr') {
    return `${sign}${sizestr(Math.abs(diff), 'M', 1024)}`
  } else {
    return `${sign}${Math.abs(diff)}${unit}`
  }
}

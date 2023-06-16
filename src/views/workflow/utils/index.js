import { WORKFLOW_TYPES, PROCESS_TYPES_OPTS } from '@/constants/workflow'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import { getCreatedAtFilter } from '@/utils/common/tableFilter'

export const statusMap = function (pdk) {
  const mp = {
    ACTIVE: {
      text: pdk === WORKFLOW_TYPES.CUSTOMER_SERVICE ? i18n.t('common_439') : i18n.t('common_440'),
      color: '#f6a100',
    },
    COMPLETED: {
      text: i18n.t('common_441'),
      color: '#7ed321',
    },
    EXTERNALLY_TERMINATED: {
      text: i18n.t('common_442'),
      color: '#8a94a6',
    },
    CUSTOM_TODO: {
      text: i18n.t('common_439'),
      color: '#f6a100',
    },
    CUSTOM_DOING: {
      text: i18n.t('common_443'),
      color: '#f6a100',
    },
  }
  return mp
}

// 审批结果
export const auditStatusMap = function (pdk) {
  const mp = {
    approved: {
      text: i18n.t('common_368'),
      color: '#7ed321',
    },
    refused: {
      text: pdk === WORKFLOW_TYPES.CUSTOMER_SERVICE ? i18n.t('common_444') : i18n.t('common_370'),
      color: '#F56C6C',
    },
  }
  return mp
}

// 状态结果
export const approveStatusMap = {
  ServiceTask_Onecloud: {
    true: i18n.t('common_445'),
    false: i18n.t('common_446'),
  },
  ServiceTask_StatusCheck: {
    true: i18n.t('common_447'),
    false: i18n.t('common_448'),
  },
  UserTask_User_Confirm: {
    true: i18n.t('common_449'),
    false: i18n.t('common_450'),
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

export const diff = (compareValue, baseValue, unit = i18n.t('common_61')) => {
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

export const CHANGE_TYPES = {
  'change-bandwidth': i18n.t('common.change_bandwidth'),
}

export const internalResourceFilters = {
  source: {
    label: i18n.t('wz_workflow_form.labels.source'),
    dropdown: true,
    filter: true,
    items: [
      { label: i18n.t('wz_workflow_form.data_from.new_order'), key: 'new_order' },
      { label: i18n.t('wz_workflow_form.data_from.irs_order'), key: 'irs_order' },
    ],
    formatter: (val) => {
      return `paramter.contains("id":"${val}")`
    },
  },
  project_name: {
    label: i18n.t('wz_workflow_form.labels.country'),
    filter: true,
    formatter: (val) => {
      return `project_name.contains(${val})`
    },
  },
  process_definition_key: {
    label: i18n.t('common_375'),
    dropdown: true,
    filter: true,
    items: [
      ...PROCESS_TYPES_OPTS.filter(v => v.value !== 'apply-internal-resource').map((v) => {
        return {
          label: v.name,
          key: v.value,
        }
      }),
      { label: i18n.t('system_process_type.1'), key: '云资源申请' },
      { label: i18n.t('system_process_type.11'), key: '云资源变更（升降配）' },
      { label: i18n.t('system_process_type.21'), key: '云资源释放' },
    ],
    formatter: (val) => {
      console.log(PROCESS_TYPES_OPTS, val)
      if (PROCESS_TYPES_OPTS.some(item => item.value === val)) {
        return `process_definition_key.equals(${val})`
      }
      return `paramter.contains("name":"${val}")`
    },
  },
  created_at: getCreatedAtFilter({ field: 'create_time' }),
}

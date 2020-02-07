import { i18nSetProperty } from '@/utils/utils'

export const WORKFLOW_TYPES = {
  APPLY_MACHINE: 'apply-machine',
  APPLY_PROJECT_QUOTA: 'apply-project-quota',
  APPLY_DOMAIN_QUOTA: 'apply-domain-quota',
  APPLY_JOIN_PROJECT: 'apply-join-project',
  APPLY_SERVER_CHANGECONFIG: 'apply-server-changeconfig',
  APPLY_SERVER_DELETE: 'apply-server-delete',
  CUSTOMER_SERVICE: 'customer-service',
}

export const PROCESS_TYPES_OPTS = [
  {
    name: '主机申请',
    value: WORKFLOW_TYPES.APPLY_MACHINE,
  },
  {
    value: WORKFLOW_TYPES.APPLY_PROJECT_QUOTA,
  },
  {
    value: WORKFLOW_TYPES.APPLY_DOMAIN_QUOTA,
  },
  {
    value: WORKFLOW_TYPES.APPLY_JOIN_PROJECT,
  },
  {
    name: '主机调整配置',
    value: WORKFLOW_TYPES.APPLY_SERVER_CHANGECONFIG,
  },
  {
    name: '主机删除',
    value: WORKFLOW_TYPES.APPLY_SERVER_DELETE,
  },
  {
    name: '技术支持工单',
    value: WORKFLOW_TYPES.CUSTOMER_SERVICE,
  },
]

i18nSetProperty({
  obj: PROCESS_TYPES_OPTS[1],
  key: 'name',
  i18nKey: 'dictionary.project',
  suffix: '配额申请',
})

i18nSetProperty({
  obj: PROCESS_TYPES_OPTS[3],
  key: 'name',
  i18nKey: 'dictionary.project',
  suffix: '申请',
  perfix: '加入',
})

i18nSetProperty({
  obj: PROCESS_TYPES_OPTS[2],
  key: 'name',
  i18nKey: 'dictionary.domain',
  suffix: '配额申请',
})

export const getWorkflowType = function (pdk) {
  const pdkObj = PROCESS_TYPES_OPTS.find((item) => {
    return pdk === item.value
  })
  return pdkObj
}

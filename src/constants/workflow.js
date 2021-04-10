import { i18nSetProperty } from '@/utils/utils'
import i18n from '@/locales'

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
    name: i18n.t('common.text00033'),
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
    name: i18n.t('common.text00034'),
    value: WORKFLOW_TYPES.APPLY_SERVER_CHANGECONFIG,
  },
  {
    name: i18n.t('common.text00035'),
    value: WORKFLOW_TYPES.APPLY_SERVER_DELETE,
  },
  {
    name: i18n.t('common.text00036'),
    value: WORKFLOW_TYPES.CUSTOMER_SERVICE,
  },
]

i18nSetProperty({
  obj: PROCESS_TYPES_OPTS[1],
  key: 'name',
  i18nKey: 'dictionary.project',
  suffix: i18n.t('common.text00037'),
})

i18nSetProperty({
  obj: PROCESS_TYPES_OPTS[3],
  key: 'name',
  i18nKey: 'dictionary.project',
  suffix: i18n.t('common.text00038'),
  perfix: i18n.t('common.text00039'),
})

i18nSetProperty({
  obj: PROCESS_TYPES_OPTS[2],
  key: 'name',
  i18nKey: 'dictionary.domain',
  suffix: i18n.t('common.text00037'),
})

export const getWorkflowType = function (pdk) {
  const pdkObj = PROCESS_TYPES_OPTS.find((item) => {
    return pdk === item.value
  })
  return pdkObj
}

export const MULTIPLE_APPROVAL_PROCESS = [WORKFLOW_TYPES.APPLY_MACHINE, WORKFLOW_TYPES.APPLY_SERVER_DELETE]

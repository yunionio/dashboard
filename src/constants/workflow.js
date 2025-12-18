import { i18nSetProperty, arrayToObj } from '@/utils/utils'
import i18n from '@/locales'

export const WORKFLOW_TYPES = {
  APPLY_MACHINE: 'apply-machine',
  APPLY_PROJECT_QUOTA: 'apply-project-quota',
  APPLY_DOMAIN_QUOTA: 'apply-domain-quota',
  APPLY_JOIN_PROJECT: 'apply-join-project',
  APPLY_SERVER_CHANGECONFIG: 'apply-server-changeconfig',
  APPLY_SERVER_DELETE: 'apply-server-delete',
  CUSTOMER_SERVICE: 'customer-service',
  APPLY_INTERNAL_RESOURCE: 'apply-internal-resource',
  APPLY_SERVER_STOP: 'apply-server-stop',
  APPLY_SERVER_RESTART: 'apply-server-restart',
  APPLY_SERVER_START: 'apply-server-start',
  EXECUTE_RESOURCE_ORDER_SET: 'execute-resource-order-set',
  ALERT_EVENT: 'alert-event',
  ALERT_TICKET: 'alert-ticket',
  EXECUTE_USER_JOIN: 'execute-user-join',
  EXECUTE_USER_UPDATE: 'execute-user-update',
  EXECUTE_USER_DELETE: 'execute-user-delete',
  EXECUTE_ROLE_SET_POLICIES: 'execute-role-set-policies',
  EXECUTE_ROLEPOLICY_BATCH_DELETE: 'execute-rolepolicy-batch-delete',
  EXECUTE_POLICY_UPDATE: 'execute-policy-update',
  EXECUTE_POLICY_ENABLE: 'execute-policy-enable',
  EXECUTE_POLICY_DISABLE: 'execute-policy-disable',
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
  {
    name: i18n.t('common.apply_internal_resource'),
    value: WORKFLOW_TYPES.APPLY_INTERNAL_RESOURCE,
  },
  {
    name: i18n.t('common.workflow.shut_down'),
    value: WORKFLOW_TYPES.APPLY_SERVER_STOP,
  },
  {
    name: i18n.t('common.workflow.start'),
    value: WORKFLOW_TYPES.APPLY_SERVER_START,
  },
  {
    name: i18n.t('common.workflow.restart'),
    value: WORKFLOW_TYPES.APPLY_SERVER_RESTART,
  },
  {
    name: i18n.t('common.workflow.order_set'),
    value: WORKFLOW_TYPES.EXECUTE_RESOURCE_ORDER_SET,
  },
  {
    name: i18n.t('common.workflow.alert_event'),
    value: WORKFLOW_TYPES.ALERT_EVENT,
  },
  {
    name: i18n.t('common.workflow.alert_ticket'),
    value: WORKFLOW_TYPES.ALERT_TICKET,
  },
  {
    name: i18n.t('common.workflow.execute_user_join'),
    value: WORKFLOW_TYPES.EXECUTE_USER_JOIN,
  },
  {
    name: i18n.t('common.workflow.execute_user_update'),
    value: WORKFLOW_TYPES.EXECUTE_USER_UPDATE,
  },
  {
    name: i18n.t('common.workflow.execute_user_delete'),
    value: WORKFLOW_TYPES.EXECUTE_USER_DELETE,
  },
  {
    name: i18n.t('common.workflow.execute_role_set_policies'),
    value: WORKFLOW_TYPES.EXECUTE_ROLE_SET_POLICIES,
  },
  {
    name: i18n.t('common.workflow.execute_rolepolicy_batch_delete'),
    value: WORKFLOW_TYPES.EXECUTE_ROLEPOLICY_BATCH_DELETE,
  },
  {
    name: i18n.t('common.workflow.execute_policy_update'),
    value: WORKFLOW_TYPES.EXECUTE_POLICY_UPDATE,
  },
  {
    name: i18n.t('common.workflow.execute_policy_enable'),
    value: WORKFLOW_TYPES.EXECUTE_POLICY_ENABLE,
  },
  {
    name: i18n.t('common.workflow.execute_policy_disable'),
    value: WORKFLOW_TYPES.EXECUTE_POLICY_DISABLE,
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

export const MULTIPLE_APPROVAL_PROCESS = [
  WORKFLOW_TYPES.APPLY_MACHINE,
  WORKFLOW_TYPES.APPLY_SERVER_DELETE,
  WORKFLOW_TYPES.APPLY_INTERNAL_RESOURCE,
  WORKFLOW_TYPES.EXECUTE_RESOURCE_ORDER_SET,
  WORKFLOW_TYPES.ALERT_TICKET,
]

export const PRIORITY_OPTS = [
  { key: 'minor', value: i18n.t('common.workflow_priority_minor') },
  { key: 'moderate', value: i18n.t('common.workflow_priority_moderate') },
  { key: 'critical', value: i18n.t('common.workflow_priority_critical') },
  { key: 'fatal', value: i18n.t('common.workflow_priority_fatal') },
]
export const PRIORITY_MAP = arrayToObj(PRIORITY_OPTS, 'key')

export const BATCH_OPERATE_SERVERS_MAX = 20

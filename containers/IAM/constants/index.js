import i18n from '@/locales'
import { arrayToObj } from '@/utils/utils'

export const NOTIFY_TOPIC_TYPES = [
  { key: 'automated_process', label: i18n.t('system.notify.topic.type.automated_process') },
  { key: 'resource', label: i18n.t('system.notify.topic.type.resource') },
]

export const NOTIFY_TOPIC_TYPES_MAP = arrayToObj(NOTIFY_TOPIC_TYPES, 'key')

export const NOTIFY_SUBSCRIBER_TYPES = [
  { key: 'receiver', label: i18n.t('system.notify.subscriber.type.receiver') },
  { key: 'role', label: i18n.t('system.notify.subscriber.type.role') },
  { key: 'robot', label: i18n.t('system.notify.subscriber.type.robot') },
]

export const NOTIFY_SUBSCRIBER_TYPES_MAP = arrayToObj(NOTIFY_SUBSCRIBER_TYPES, 'key')

export const NOTIFY_TOPIC_NAMES_MAP = {
  'resource sync': i18n.t('system.notify.name.resource_sync'),
  'snapshot policy execute': i18n.t('system.notify.name.snapshot_policy_execute'),
  'scheduled task execute': i18n.t('system.notify.name.scheduled_task_execute'),
  'scaling policy execute': i18n.t('system.notify.name.scaling_policy_execute'),
  'resource update': i18n.t('system.notify.name.resource_update'),
  'resource release due 3 day': i18n.t('system.notify.name.resource_release_due_3_day'),
  'resource release due 1 day': i18n.t('system.notify.name.resource_release_due_1_day'),
  'resource release due 30 day': i18n.t('system.notify.name.resource_release_due_n_day', [30]),
  'resource operation failed': i18n.t('system.notify.name.resource_operation_failed'),
  'resource create or delete': i18n.t('system.notify.name.resource_create_or_delete'),
  'resource change config': i18n.t('system.notify.name.resource_change_config'),
}

export const NOTIFY_ROLE_SCOPES = [
  { key: 'system', label: i18n.t('common_235') + i18n.t('common_723') },
  { key: 'domain', label: i18n.t('common_235') + i18n.t('common_437') },
  { key: 'project', label: i18n.t('common_235') + i18n.t('common_310') },
]

export const NOTIFY_ROLE_SCOPES_MAP = arrayToObj(NOTIFY_ROLE_SCOPES, 'key')

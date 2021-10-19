import { arrayToObj } from '@/utils/utils'
import i18n from '@/locales'

export const ROBOT_TYPES = [
  { key: 'dingtalk', label: i18n.t('system.text_303') },
  { key: 'feishu', label: i18n.t('system.text_304') },
  { key: 'workwx', label: i18n.t('system.wecom.bot') },
  { key: 'webhook', label: 'Webhook' },
]

export const ROBOT_TYPE = arrayToObj(ROBOT_TYPES, 'key')

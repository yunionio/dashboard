import i18n from '@/locales'
import { arrayToObj } from '@/utils/utils'

export const PRICE_COMPARA_KEY_SUFFIX = '__oc_price_compara_'

export const BLOCKED_RESOURCES = [
  { label: i18n.t('dictionary.snapshot'), value: 'snapshot' },
  { label: i18n.t('dictionary.eip'), value: 'eip' },
  { label: i18n.t('dictionary.dbinstances'), value: 'dbinstance' },
  { label: i18n.t('dictionary.elasticcache'), value: 'elasticcache' },
  { label: i18n.t('dictionary.nat'), value: 'natgateway' },
  { label: i18n.t('dictionary.file_system'), value: 'file_system' },
  { label: i18n.t('scope.text_79'), value: 'kubecluster' },
  { label: i18n.t('dictionary.dbinstancebackups'), value: 'dbinstancebackups' },
]

export const BLOCKED_RESOURCES_MAP = arrayToObj(BLOCKED_RESOURCES, 'value')

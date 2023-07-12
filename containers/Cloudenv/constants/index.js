import i18n from '@/locales'
import { arrayToObj } from '@/utils/utils'

export const PRICE_COMPARA_KEY_SUFFIX = '__oc_price_compara_'

export const BLOCKED_RESOURCES = [
  { label: i18n.t('dictionary.snapshot'), value: 'snapshots' },
  { label: i18n.t('dictionary.eip'), value: 'eips' },
  { label: i18n.t('dictionary.dbinstances'), value: 'dbinstances' },
  { label: i18n.t('dictionary.elasticcache'), value: 'elasticcaches' },
  { label: i18n.t('dictionary.nat'), value: 'natgateways' },
  { label: i18n.t('dictionary.file_system'), value: 'file_systems' },
  { label: i18n.t('scope.text_79'), value: 'kubeclusters' },
]

export const BLOCKED_RESOURCES_MAP = arrayToObj(BLOCKED_RESOURCES, 'value')

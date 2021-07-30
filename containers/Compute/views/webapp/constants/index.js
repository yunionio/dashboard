import { arrayToObj } from '@/utils/utils'
import i18n from '@/locales'

export const WEBAPP_TYPES = [
  { key: 'web', label: i18n.t('compute.webapp.web') },
]

export const WEBAPP_TYPE = arrayToObj(WEBAPP_TYPES, 'key')

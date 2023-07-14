import i18n from '@/locales'
import { arrayToObj } from '@/utils/utils'

export const BGP_TYPES = [
  { label: i18n.t('common.bgp_type_options.bgp'), value: 'BGP' },
  { label: i18n.t('common.bgp_type_options.bgp_pro'), value: 'BGP_PRO' },
]
export const BGP_TYPES_MAP = arrayToObj(BGP_TYPES, 'value')

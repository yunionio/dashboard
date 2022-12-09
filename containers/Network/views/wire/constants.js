import i18n from '@/locales'

export const WIRE_MONITOR_OPTS = [
  {
    name: 'cpu',
    label: i18n.t('compute.text_523'),
    seleteItem: 'usage_percent',
    fromItem: 'wire_cpu',
    as: i18n.t('compute.text_528'),
    unit: '%',
    transfer: 1,
  },
  {
    name: 'mem',
    label: i18n.t('compute.text_518'),
    seleteItem: 'usage_percent',
    as: i18n.t('compute.text_518'),
    fromItem: 'wire_mem',
    unit: '%',
    transfer: 1,
  },
]

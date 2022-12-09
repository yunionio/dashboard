import i18n from '@/locales'

export const STORAGE_MONITOR_OPTS = [
  {
    name: 'free',
    label: i18n.t('storage.free'),
    seleteItem: 'free',
    fromItem: 'storage',
    as: i18n.t('storage.free'),
    unit: 'M',
    transfer: 1024,
  },
  {
    name: 'usage_active',
    label: i18n.t('storage.usage_active'),
    seleteItem: 'usage_active',
    as: i18n.t('storage.usage_active'),
    fromItem: 'storage',
    unit: '%',
    transfer: 1,
  },
]

import i18n from '@/locales'
export const imageTypeOptions = [
  { label: i18n.t('system.text_25'), value: '' },
  { label: i18n.t('system.text_26'), value: 'image' },
  { label: 'ISO', value: 'iso' },
]

export const cloudEnvOptions = [
  { label: i18n.t('system.text_25'), value: '' },
  { label: i18n.t('system.text_27'), value: 'onpremise' },
  { label: i18n.t('system.text_28'), value: 'private' },
  { label: i18n.t('system.text_29'), value: 'public' },
]

export const hypervisorOptions = [
  { label: i18n.t('system.text_25'), value: '' },
  { label: i18n.t('system.text_30'), value: 'kvm' },
  { label: i18n.t('system.text_31'), value: 'baremetal' },
]

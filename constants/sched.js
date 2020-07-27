import i18n from '@/locales'
export const STRATEGY_CN = {
  prefer: i18n.t('cloudenv.text_1'),
  avoid: i18n.t('cloudenv.text_2'),
  exclude: i18n.t('cloudenv.text_3'),
  // require: '必须使用',
  '': i18n.t('cloudenv.text_4'),
}

export const RES_TYPES = { hosts: i18n.t('cloudenv.text_5'), storages: i18n.t('cloudenv.text_6'), networks: i18n.t('cloudenv.text_7') }

export const STRATEGY_OPT = (() => Object.entries(STRATEGY_CN).map(val => ({ label: val[1], key: val[0] })))()

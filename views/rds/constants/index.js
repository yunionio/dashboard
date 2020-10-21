import i18n from '@/locales'
export const DBINSTANCE_CATEGORY_KEYS = ['replica', 'basic', 'single', 'high_availability', 'ha', 'finance', 'gr', 'always_on', 'FIRST_GEN', 'SECOND_GEN']
export const DBINSTANCE_CATEGORY = {
  basic: i18n.t('db.text_76'),
  high_availability: i18n.t('db.text_77'),
  always_on: i18n.t('db.text_78'),
  finance: i18n.t('db.text_79'),
  ha: i18n.t('db.text_77'),
  fe: i18n.t('db.text_341'),
  single: i18n.t('db.text_76'),
  replica: i18n.t('db.text_6'),
  gr: i18n.t('db.text_79'),
  SECOND_GEN: i18n.t('db.text_80'),
  FIRST_GEN: i18n.t('db.text_81'),
  Regional: i18n.t('common_469'),
  Zonal: i18n.t('common_470'),
}

export const DBINSTANCE_STORAGE_TYPE_KEYS = ['SATA', 'SAS', 'SSD', 'local_ssd', 'cloud_ssd', 'cloud_essd', 'cloud_essd2', 'cloud_essd3', 'PD_SSD', 'PD_HDD', 'HIGH', 'ULTRAHIGH', 'ULTRAHIGHPRO', 'COMMON']
export const DBINSTANCE_STORAGE_TYPE = {
  local_ssd: i18n.t('db.text_82'),
  cloud_essd: i18n.t('db.text_83'),
  cloud_ssd: i18n.t('db.text_84'),
  SSD: i18n.t('db.text_85'),
  SAS: i18n.t('db.text_86'),
  SATA: i18n.t('db.text_87'),
  PD_SSD: 'SSD',
  PD_HDD: 'HDD',
  ULTRAHIGH: i18n.t('db.text_88'),
  HIGH: i18n.t('db.text_89'),
  ULTRAHIGHPRO: i18n.t('db.text_90'),
  COMMON: 'COMMON',
  cloud_essd2: i18n.t('db.text_91'),
  cloud_essd3: i18n.t('db.text_92'),
}

export const ACCOUNT_PRIVILEGES = {
  rw: i18n.t('db.text_5'),
  r: i18n.t('db.text_6'),
  ddl: i18n.t('db.text_7'),
  dml: i18n.t('db.text_8'),
  owner: i18n.t('db.text_9'),
  custom: i18n.t('db.text_10'),
}
export const ENGINR_VERSION_SERVER_HUAWEI_KYES = ['2008_R2_WEB', '2008_R2_EE', '2012_WEB', '2012_EE', '2012_SE', '2014_WEB', '2014_SE', '2014_EE', '2016_WEB', '2016_SE', '2016_EE', '2017_WEB', '2017_SE', '2017_EE']
export const ENGINR_VERSION_SERVER_ALIYUN_KYES = ['2008r2', '08r2_ent_ha', '2012_web', '2012_std_ha', '2012_ent_ha', '2012', '2014_std_ha', '2014_ent_ha', '2016_web', '2016_std_ha', '2016_ent_ha', '2017_std_ha', '2017_ent', '2017 Enterprise', '2017 Express', '2017 Standard', '2017 Web', '2019_std_ha']
export const ENGINR_VERSION_POSTGRE_KYES = ['9.5', '9.6', '10', '11', '1.0']
// Elasticache机型翻译
export const ENGINR_VERSION = {
  EE: i18n.t('db.text_93'),
  WEB: i18n.t('db.text_94'),
  SE: i18n.t('db.text_95'),
  '2017_ent': i18n.t('db.text_96'),
  '2016_std_ha': i18n.t('db.text_97'),
  '2008r2': '2008 R2',
  '08r2_ent_ha': i18n.t('db.text_98'),
  '2016_web': '2016 WEB',
  '2012_web': '2012 WEB',
  '2016_ent_ha': i18n.t('db.text_99'),
  '2012_ent_ha': i18n.t('db.text_100'),
  2012: i18n.t('db.text_101'),
  '2017_std_ha': i18n.t('db.text_102'),
  '2012_std_ha': i18n.t('db.text_103'),
  '1.0': i18n.t('db.text_104'),
  '2014_ent_ha': i18n.t('db.text_105'),
  '2014_std_ha': i18n.t('db.text_106'),
  '2019_std_ha': i18n.t('db.text_107'),
}

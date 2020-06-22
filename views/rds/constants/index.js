export const DBINSTANCE_CATEGORY_KEYS = ['replica', 'basic', 'single', 'high_availability', 'ha', 'finance', 'gr', 'always_on', 'FIRST_GEN', 'SECOND_GEN']
export const DBINSTANCE_CATEGORY = {
  basic: '基础版',
  high_availability: '高可用',
  always_on: '集群版',
  finance: '金融版',
  ha: '高可用',
  single: '基础版',
  replica: '只读',
  gr: '金融版',
  SECOND_GEN: '第二代',
  FIRST_GEN: '第一代',
}

export const DBINSTANCE_STORAGE_TYPE_KEYS = ['SATA', 'SAS', 'SSD', 'local_ssd', 'cloud_ssd', 'cloud_essd', 'cloud_essd2', 'cloud_essd3', 'PD_SSD', 'PD_HDD', 'HIGH', 'ULTRAHIGH', 'ULTRAHIGHPRO', 'COMMON']
export const DBINSTANCE_STORAGE_TYPE = {
  local_ssd: '本地SSD盘',
  cloud_essd: 'ESSD云盘',
  cloud_ssd: 'SSD云盘',
  SSD: '超高IO云硬盘',
  SAS: '高IO云硬盘',
  SATA: '普通IO云硬盘',
  PD_SSD: 'SSD',
  PD_HDD: 'HDD',
  ULTRAHIGH: '超高IO',
  HIGH: '高IO',
  ULTRAHIGHPRO: '超高IO（尊享版）',
  COMMON: 'COMMON',
  cloud_essd2: 'ESSD PL 云盘2',
  cloud_essd3: 'ESSD PL 云盘3',
}

export const ACCOUNT_PRIVILEGES = {
  rw: '读写',
  r: '只读',
  ddl: '仅DDL',
  dml: '仅DML',
  owner: '所有者',
  custom: '自定义',
}
export const ENGINR_VERSION_SERVER_HUAWEI_KYES = ['2008_R2_WEB', '2008_R2_EE', '2012_WEB', '2012_EE', '2012_SE', '2014_WEB', '2014_SE', '2014_EE', '2016_WEB', '2016_SE', '2016_EE', '2017_WEB', '2017_SE', '2017_EE']
export const ENGINR_VERSION_SERVER_ALIYUN_KYES = ['2012_web', '2012_std_ha', '2012', '2012_ent_ha', '2016_web', '2016_std_ha', '2016_ent_ha', '2017_std_ha', '2017_ent', '2017 Enterprise', '2017 Express', '2017 Standard', '2017 Web']
export const ENGINR_VERSION_POSTGRE_KYES = ['9.5', '9.6', '10', '11', '1.0']
// Elasticache机型翻译
export const ENGINR_VERSION = {
  EE: '企业版',
  WEB: 'web版',
  SE: '标准版',
  '2017_ent': '2017 企业集群版',
  '2016_std_ha': '2016 标准版',
  '2008r2': '2008 R2',
  '2016_web': '2016 WEB',
  '2012_web': '2012 WEB',
  '2016_ent_ha': '2016 企业版',
  '2012_ent_ha': '2012 企业版',
  2012: '2012 企业版 单机',
  '2017_std_ha': '2017 标准版',
  '2012_std_ha': '2012 标准版',
  '1.0': '增强版',
}

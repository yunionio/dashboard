export const DBINSTANCE_CATEGORY = {
  basic: '基础版',
  high_availability: '高可用',
  always_on: '集群版',
  finance: '金融版',
  ha: '主备',
  single: '单机',
  replica: '只读',
  gr: '金融版',
}

export const DBINSTANCE_STORAGE_TYPE = {
  local_ssd: '本地SSD盘',
  cloud_essd: 'ESSD云盘',
  cloud_ssd: 'SSD云盘',
  SSD: '超高IO云硬盘',
  SAS: '高IO云硬盘',
  SATA: '普通IO云硬盘',
}

export const PRIVILEGES = {
  rw: '读写',
  r: '只读',
  ddl: '仅DDL',
  dml: '仅DML',
  owner: '所有者',
  custom: '自定义',
}

// Elasticache机型翻译
export const ENGINR_VERSION = {
  'EE': '企业版',
  'WEB': 'web版',
  'SE': '标准版',
}

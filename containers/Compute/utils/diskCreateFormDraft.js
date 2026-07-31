/**
 * 磁盘创建页：控件级草稿 fieldKey 注册表
 *
 * formScope + fieldKey；复合控件值为嵌套对象。
 * 不落盘：name / description / password / encrypt_keys
 */
export const DISK_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  AREA_SELECTS: 'areaSelects',
  ENABLE_WORLD_MAP: 'enableWorldMap',
  HYPERVISOR: 'hypervisor',
  CLOUDPROVIDER: 'cloudprovider',
  BACKEND: 'backend',
  SIZE: 'size',
  STORAGE_ID: 'storageId',
  IOPS: 'iops',
  THROUGHPUT: 'throughput',
  TAG: 'tag',
}

/**
 * 页面 form.fc 简单字段（改值走 onValuesChange → sync）
 * types 缺省 = 全环境（idc/public/private）
 */
export const DISK_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: DISK_CREATE_FORM_DRAFT_FIELD.ENABLE_WORLD_MAP, formField: 'enableWorldMap', types: ['public'] },
  // hypervisor 由 HypervisorRadio 在 options 就绪后回填
  { key: DISK_CREATE_FORM_DRAFT_FIELD.CLOUDPROVIDER, formField: 'manager_id' },
  // 以下字段仅落盘；回填在 getStorageOpts / restoreDiskFieldDraftsAfterStorageReady
  { key: DISK_CREATE_FORM_DRAFT_FIELD.BACKEND, formField: 'backend', restore: false },
  { key: DISK_CREATE_FORM_DRAFT_FIELD.SIZE, formField: 'size', restore: false },
  { key: DISK_CREATE_FORM_DRAFT_FIELD.STORAGE_ID, formField: 'storage', restore: false },
  { key: DISK_CREATE_FORM_DRAFT_FIELD.IOPS, formField: 'iops', restore: false },
  { key: DISK_CREATE_FORM_DRAFT_FIELD.THROUGHPUT, formField: 'throughput', restore: false },
]

export function getDiskCreateFormDraftScope ({ cloudEnv }) {
  if (!cloudEnv) return ''
  const type = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
  return `compute.disk.${type}`
}

/** 模板 :form-draft-key="diskDraftFields.xxx" */
export const DISK_CREATE_FORM_DRAFT_FIELDS = Object.keys(DISK_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  const value = DISK_CREATE_FORM_DRAFT_FIELD[constKey]
  map[value] = value
  return map
}, {})

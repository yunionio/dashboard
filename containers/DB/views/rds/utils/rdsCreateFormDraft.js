/**
 * RDS 创建页：控件级草稿 fieldKey 注册表
 *
 * formScope: db.rds.create
 * 不落盘：generate_name / name / description / password / loginPassword / loginKeypair
 */
export const RDS_CREATE_FORM_DRAFT_FIELD = {
  DOMAIN_PROJECT: 'domainProject',
  BILLING_TYPE: 'billingType',
  DURATION: 'duration',
  COUNT: 'count',
  AREA_SELECTS: 'areaSelects',
  ENGINE: 'engine',
  ENGINE_VERSION: 'engineVersion',
  CATEGORY: 'category',
  STORAGE_TYPE: 'storageType',
  VCPU_COUNT: 'vcpuCount',
  VMEM_SIZE_MB: 'vmemSizeMb',
  ZONES: 'zones',
  SKU: 'sku',
  DISK_SIZE: 'diskSize',
  NETWORK: 'network',
  SECGROUP: 'secgroup',
}

export const RDS_CREATE_FORM_DRAFT_SCOPE = 'db.rds.create'

/** 简单 form.fc 字段（bindFormFcFieldDraft） */
export const RDS_CREATE_FORM_DRAFT_FC_BINDINGS = [
  { key: RDS_CREATE_FORM_DRAFT_FIELD.BILLING_TYPE, formField: 'billing_type' },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.COUNT, formField: '__count__' },
  // 以下由 Filters/SizeFilters/List 在列表就绪后经 getCreateFormDraftPreferred 回填
  { key: RDS_CREATE_FORM_DRAFT_FIELD.ENGINE, formField: 'engine', restore: false },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.ENGINE_VERSION, formField: 'engine_version', restore: false },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.CATEGORY, formField: 'category', restore: false },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.STORAGE_TYPE, formField: 'storage_type', restore: false },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.VCPU_COUNT, formField: 'vcpu_count', restore: false },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.VMEM_SIZE_MB, formField: 'vmem_size_mb', restore: false },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.ZONES, formField: 'zones', restore: false },
  { key: RDS_CREATE_FORM_DRAFT_FIELD.SKU, formField: 'sku', restore: false },
  // 容量由 DiskInput 在 SKU 约束就绪后夹取（仍落盘）
  { key: RDS_CREATE_FORM_DRAFT_FIELD.DISK_SIZE, formField: 'disk_size_gb' },
]

/** 模板 :form-draft-key="rdsDraftFields.xxx" */
export const RDS_CREATE_FORM_DRAFT_FIELDS = Object.keys(RDS_CREATE_FORM_DRAFT_FIELD).reduce((map, constKey) => {
  map[RDS_CREATE_FORM_DRAFT_FIELD[constKey]] = RDS_CREATE_FORM_DRAFT_FIELD[constKey]
  return map
}, {})
